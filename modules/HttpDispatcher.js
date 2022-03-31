import serveFile from "./ServeFile.js";
import URLSearchParamsCaseInsensitive from "./URLSearchParamsCaseInsensitive.js";

function sendStatus(response, statusCode, data=undefined) {
	response.writeHead(statusCode);
	response.end(data);
}


class HttpDispatcher {
	request(sPath, request, response) {
		sendStatus(response, 404);
	}

	upgrade(sPath, request, socket, head) {
		socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
		socket.destroy();
	}

	connect(sPath, request, socket, head) {
		socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
		socket.destroy();
	}



	getUrlObject(request) {
		return new URL(request.url, "https://"+request.headers.host);
	}
	getSearchParams(request, caseSensitive=true) {
		let searchParams = caseSensitive? new URLSearchParams() : new URLSearchParamsCaseInsensitive();
		let url = this.getUrlObject(request);
		for(let [key, value] of url.searchParams) {
			searchParams.append(key, value);
		}
		searchParams.get = function(name, defaultValue=null) {
			if(this.has(name)) {
				return this.constructor.prototype.get.call(this, name);
			}
			return defaultValue;
		}
		return searchParams;
	}

	splitPath(sPath) {
		if(typeof sPath !== "string") {
			return null;
		}
		sPath = sPath.replace(/^\/+|\/+$/g, "");
		if(!sPath) {
			return ["/"];
		}
		var aPathElements = sPath.split("/");

		var iLen = aPathElements.length;
		for(var ii=0;ii<iLen;++ii) {
			if(!aPathElements[ii]) {
				return null;
			}
		}

		return aPathElements;
	}
};


class HttpDispatcherGroup extends HttpDispatcher {
	moDispatchers = {};
	moFallbackDispatcher = {
		request: null,
		upgrade: null,
		connect: null,
	};
	mbCaseSensitive;

	constructor(bCaseSensitive=false) {
		super();
		this.mbCaseSensitive = !!bCaseSensitive;
	}

	setFallbackDispatcher(oDispatcher) {
		this.setRequestFallbackDispatcher(oDispatcher);
		this.setUpgradeFallbackDispatcher(oDispatcher);
		this.setConnectFallbackDispatcher(oDispatcher);
		return this;
	}
	setRequestFallbackDispatcher(oDispatcher) {
		if(oDispatcher instanceof HttpDispatcher) {
			this.moFallbackDispatcher.request = oDispatcher;
		}
		return this;
	}
	setUpgradeFallbackDispatcher(oDispatcher) {
		if(oDispatcher instanceof HttpDispatcher) {
			this.moFallbackDispatcher.upgrade = oDispatcher;
		}
		return this;
	}
	setConnectFallbackDispatcher(oDispatcher) {
		if(oDispatcher instanceof HttpDispatcher) {
			this.moFallbackDispatcher.connect = oDispatcher;
		}
		return this;
	}

	fallbackRequest(sPath, request, response, ...args) {
		if(this.moFallbackDispatcher.request instanceof HttpDispatcher) {
			this.moFallbackDispatcher.request.request(sPath, request, response, ...args);
		}
		else {
			super.request(sPath, request, response, ...args);
		}
		return this;
	}
	fallbackUpgrade(sPath, request, socket, head) {
		if(this.moFallbackDispatcher.upgrade instanceof HttpDispatcher) {
			this.moFallbackDispatcher.upgrade.upgrade(sPath, request, socket, head);
		}
		else {
			super.upgrade(sPath, request, socket, head);
		}
		return this;
	}
	fallbackConnect(sPath, request, socket, head) {
		if(this.moFallbackDispatcher.connect instanceof HttpDispatcher) {
			this.moFallbackDispatcher.connect.connect(sPath, request, socket, head);
		}
		else {
			super.connect(sPath, request, socket, head);
		}
		return this;
	}



	getDispatcher(sPath) {
		if(typeof sPath !== "string") {
			return {
				dispatcher: null,
				path: sPath,
			};
		}

		let aPathElements = this.splitPath(sPath);
		if(!aPathElements) {
			return {
				dispatcher: null,
				path: "",
			};
		}

		let iLen = aPathElements.length - 1;
		let oDispatcherParent = this.moDispatchers;
		for(let ii=0;ii<iLen;++ii) {
			let sIndex = aPathElements[ii];
			if(!this.mbCaseSensitive) {
				sIndex = sIndex.toUpperCase();
			}

			if(!oDispatcherParent.hasOwnProperty(sIndex)) {
				if(!ii && this.moDispatchers.hasOwnProperty("/")) {
					return {
						dispatcher: this.moDispatchers["/"],
						path: sPath,
					};
				}
				return {
					dispatcher: null,
					path: sPath,
				};
			}
			oDispatcherParent = oDispatcherParent[sIndex];

			if(oDispatcherParent instanceof HttpDispatcher) {
				let sNewPath = aPathElements[ii+1];
				for(let kk=ii+2;kk<=iLen;++kk) {
					sNewPath += "/"+aPathElements[kk];
				}
				return {
					dispatcher: oDispatcherParent,
					path: sNewPath,
				};
			}
		}
		let sLastIndex = aPathElements[iLen];
		if(!this.mbCaseSensitive) {
			sLastIndex = sLastIndex.toUpperCase();
		}
		if(oDispatcherParent.hasOwnProperty(sLastIndex) && oDispatcherParent[sLastIndex] instanceof HttpDispatcher) {
			return {
				dispatcher: oDispatcherParent[sLastIndex],
				path: "",
			};
		}

		if(this.moDispatchers.hasOwnProperty("/")) {
			return {
				dispatcher: this.moDispatchers["/"],
				path: sPath,
			};
		}
		return {
			dispatcher: null,
			path: sPath,
		};
	}

	request(sPath, request, response, ...args) {
		let {dispatcher: oDispatcher, path: sNewPath} = this.getDispatcher(sPath);
		if(oDispatcher) {
			oDispatcher.request(sNewPath, request, response, ...args);
		}
		else {
			this.fallbackRequest(sNewPath, request, response, ...args);
		}
	}

	upgrade(sPath, request, socket, head) {
		let {dispatcher: oDispatcher, path: sNewPath} = this.getDispatcher(sPath);
		if(oDispatcher) {
			oDispatcher.upgrade(sNewPath, request, socket, head);
		}
		else {
			this.fallbackUpgrade(sNewPath, request, socket, head);
		}
	}

	connect(sPath, request, socket, head) {
		let {dispatcher: oDispatcher, path: sNewPath} = this.getDispatcher(sPath);
		if(oDispatcher) {
			oDispatcher.connect(sNewPath, request, socket, head);
		}
		else {
			this.fallbackConnect(sNewPath, request, socket, head);
		}
	}

	addDispatcher(sPath, oDispatcher) {
		if(typeof sPath !== "string") {
			return this;
		}
		if(!oDispatcher instanceof HttpDispatcher) {
			return this;
		}
		if(!this.mbCaseSensitive) {
			sPath = sPath.toUpperCase();
		}
		let aPathElements = this.splitPath(sPath);
		if(!aPathElements) {
			return this;
		}

		let iLen = aPathElements.length - 1;
		let oDispatcherParent = this.moDispatchers;
		for(let ii=0;ii<iLen;++ii) {
			let sIndex = aPathElements[ii];
			if(!oDispatcherParent.hasOwnProperty(sIndex)) {
				oDispatcherParent[sIndex] = {};
			}
			oDispatcherParent = oDispatcherParent[sIndex];
		}
		oDispatcherParent[aPathElements[iLen]] = oDispatcher;

		return this;
	}
}


class HttpMethodDispatcher extends HttpDispatcher {
	moDispatchers = {};

	request(sPath, request, response, ...args) {
		if(this.moDispatchers[request.method] instanceof HttpDispatcher) {
			this.moDispatchers[request.method].request(sPath, request, response, ...args);
		}
		else {
			super.request(sPath, request, response, ...args);
		}
	}

	connect(sPath, request, socket, head) {
		if(this.moDispatchers["CONNECT"] instanceof HttpDispatcher) {
			this.moDispatchers["CONNECT"].connect(sPath, request, socket, head);
		}
		else {
			super.connect(sPath, request, socket, head);
		}
	}



	setGetDispatcher(oDispatcher) {
		if(oDispatcher instanceof HttpDispatcher) {
			this.moDispatchers["GET"] = oDispatcher;
		}
	}
	setHeadDispatcher(oDispatcher) {
		if(oDispatcher instanceof HttpDispatcher) {
			this.moDispatchers["HEAD"] = oDispatcher;
		}
	}
	setPostDispatcher(oDispatcher) {
		if(oDispatcher instanceof HttpDispatcher) {
			this.moDispatchers["POST"] = oDispatcher;
		}
	}
	setPutDispatcher(oDispatcher) {
		if(oDispatcher instanceof HttpDispatcher) {
			this.moDispatchers["PUT"] = oDispatcher;
		}
	}
	setDeleteDispatcher(oDispatcher) {
		if(oDispatcher instanceof HttpDispatcher) {
			this.moDispatchers["DELETE"] = oDispatcher;
		}
	}
	setConnectDispatcher(oDispatcher) {
		if(oDispatcher instanceof HttpDispatcher) {
			this.moDispatchers["CONNECT"] = oDispatcher;
		}
	}
	setOptionsDispatcher(oDispatcher) {
		if(oDispatcher instanceof HttpDispatcher) {
			this.moDispatchers["OPTIONS"] = oDispatcher;
		}
	}
	setTraceDispatcher(oDispatcher) {
		if(oDispatcher instanceof HttpDispatcher) {
			this.moDispatchers["TRACE"] = oDispatcher;
		}
	}
	setPatchDispatcher(oDispatcher) {
		if(oDispatcher instanceof HttpDispatcher) {
			this.moDispatchers["PATCH"] = oDispatcher;
		}
	}
}


class HttpDirectoryDispatcher extends HttpDispatcher {
	msDirectory;

	constructor(sDirectory) {
		super();
		this.msDirectory = sDirectory;
	}

	cleanFilePath(sPath) {
		let aPathElements = sPath.split("/");
		let sFilePath = "";
		for(let ii=0;ii<aPathElements.length;++ii) {
			switch(aPathElements[ii]) {
				case "..":
					return null;

				case ".":
					continue;

				default:
					sFilePath += "/"+aPathElements[ii];
			}
		}
		return sFilePath;
	}

	request(sPath, request, response, ...args) {;
		if(request.method !== "GET") {
			sendStatus(response, 405);
			return;
		}
		let sCleanFilePath = this.cleanFilePath(sPath);
		if(!sCleanFilePath) {
			sendStatus(response, 404);
			return;
		}
		serveFile(this.msDirectory + sCleanFilePath, response);
	}
}


export {
	HttpDispatcher,
	HttpDispatcherGroup,
	HttpMethodDispatcher,
	HttpDirectoryDispatcher,

	sendStatus
};
export default HttpDispatcher;
