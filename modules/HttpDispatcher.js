import serveFile from "./ServeFile.js";
import URLSearchParamsCaseInsensitive from "./URLSearchParamsCaseInsensitive.js";

function sendStatus(response, statusCode, data=undefined) {
	response.writeHead(statusCode);
	response.end(data);
}
function sendResult(response, data={}) {
	response.setHeader("Content-Type", "application/json");
	response.writeHead(200);
	response.end(JSON.stringify(data));
}


class HttpDispatcher {
	request(path, request, response) {
		sendStatus(response, 404);
	}

	upgrade(path, request, socket, head) {
		socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
		socket.destroy();
	}

	connect(path, request, socket, head) {
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

	splitPath(path) {
		if(typeof path !== "string") {
			return null;
		}
		path = path.replace(/^\/+|\/+$/g, "");
		if(!path) {
			return ["/"];
		}
		let pathElements = path.split("/");

		let len = pathElements.length;
		for(let ii=0;ii<len;++ii) {
			if(!pathElements[ii]) {
				return null;
			}
		}

		return pathElements;
	}
};


class HttpDispatcherGroup extends HttpDispatcher {
	dispatchers = {};
	fallbackDispatcher = {
		request: null,
		upgrade: null,
		connect: null,
	};
	caseSensitive;

	constructor(caseSensitive=false) {
		super();
		this.caseSensitive = !!caseSensitive;
	}

	setFallbackDispatcher(dispatcher) {
		this.setRequestFallbackDispatcher(dispatcher);
		this.setUpgradeFallbackDispatcher(dispatcher);
		this.setConnectFallbackDispatcher(dispatcher);
		return this;
	}
	setRequestFallbackDispatcher(dispatcher) {
		if(dispatcher instanceof HttpDispatcher) {
			this.fallbackDispatcher.request = dispatcher;
		}
		return this;
	}
	setUpgradeFallbackDispatcher(dispatcher) {
		if(dispatcher instanceof HttpDispatcher) {
			this.fallbackDispatcher.upgrade = dispatcher;
		}
		return this;
	}
	setConnectFallbackDispatcher(dispatcher) {
		if(dispatcher instanceof HttpDispatcher) {
			this.fallbackDispatcher.connect = dispatcher;
		}
		return this;
	}

	fallbackRequest(path, request, response, ...args) {
		if(this.fallbackDispatcher.request instanceof HttpDispatcher) {
			this.fallbackDispatcher.request.request(path, request, response, ...args);
		}
		else {
			super.request(path, request, response, ...args);
		}
		return this;
	}
	fallbackUpgrade(path, request, socket, head) {
		if(this.fallbackDispatcher.upgrade instanceof HttpDispatcher) {
			this.fallbackDispatcher.upgrade.upgrade(path, request, socket, head);
		}
		else {
			super.upgrade(path, request, socket, head);
		}
		return this;
	}
	fallbackConnect(path, request, socket, head) {
		if(this.fallbackDispatcher.connect instanceof HttpDispatcher) {
			this.fallbackDispatcher.connect.connect(path, request, socket, head);
		}
		else {
			super.connect(path, request, socket, head);
		}
		return this;
	}



	getDispatcher(path) {
		if(typeof path !== "string") {
			return {
				dispatcher: null,
				path: path,
			};
		}

		let pathElements = this.splitPath(path);
		if(!pathElements) {
			return {
				dispatcher: null,
				path: "",
			};
		}

		let len = pathElements.length - 1;
		let dispatcherParent = this.dispatchers;
		for(let ii=0;ii<len;++ii) {
			let index = pathElements[ii];
			if(!this.caseSensitive) {
				index = index.toUpperCase();
			}

			if(!dispatcherParent.hasOwnProperty(index)) {
				if(!ii && this.dispatchers.hasOwnProperty("/")) {
					return {
						dispatcher: this.dispatchers["/"],
						path: path,
					};
				}
				return {
					dispatcher: null,
					path: path,
				};
			}
			dispatcherParent = dispatcherParent[index];

			if(dispatcherParent instanceof HttpDispatcher) {
				let sNewPath = pathElements[ii+1];
				for(let kk=ii+2;kk<=len;++kk) {
					sNewPath += "/"+pathElements[kk];
				}
				return {
					dispatcher: dispatcherParent,
					path: sNewPath,
				};
			}
		}
		let lastIndex = pathElements[len];
		if(!this.caseSensitive) {
			lastIndex = lastIndex.toUpperCase();
		}
		if(dispatcherParent.hasOwnProperty(lastIndex) && dispatcherParent[lastIndex] instanceof HttpDispatcher) {
			return {
				dispatcher: dispatcherParent[lastIndex],
				path: "",
			};
		}

		if(this.dispatchers.hasOwnProperty("/")) {
			return {
				dispatcher: this.dispatchers["/"],
				path: path,
			};
		}
		return {
			dispatcher: null,
			path: path,
		};
	}

	request(path, request, response, ...args) {
		let {dispatcher: dispatcher, path: newPath} = this.getDispatcher(path);
		if(dispatcher) {
			dispatcher.request(newPath, request, response, ...args);
		}
		else {
			this.fallbackRequest(newPath, request, response, ...args);
		}
	}

	upgrade(path, request, socket, head) {
		let {dispatcher: dispatcher, path: newPath} = this.getDispatcher(path);
		if(dispatcher) {
			dispatcher.upgrade(newPath, request, socket, head);
		}
		else {
			this.fallbackUpgrade(newPath, request, socket, head);
		}
	}

	connect(path, request, socket, head) {
		let {dispatcher: dispatcher, path: newPath} = this.getDispatcher(path);
		if(dispatcher) {
			dispatcher.connect(newPath, request, socket, head);
		}
		else {
			this.fallbackConnect(newPath, request, socket, head);
		}
	}

	addDispatcher(path, dispatcher) {
		if(typeof path !== "string") {
			return this;
		}
		if(!dispatcher instanceof HttpDispatcher) {
			return this;
		}
		if(!this.caseSensitive) {
			path = path.toUpperCase();
		}
		let pathElements = this.splitPath(path);
		if(!pathElements) {
			return this;
		}

		let len = pathElements.length - 1;
		let dispatcherParent = this.dispatchers;
		for(let ii=0;ii<len;++ii) {
			let index = pathElements[ii];
			if(!dispatcherParent.hasOwnProperty(index)) {
				dispatcherParent[index] = {};
			}
			dispatcherParent = dispatcherParent[index];
		}
		dispatcherParent[pathElements[len]] = dispatcher;

		return this;
	}
}


class HttpMethodDispatcher extends HttpDispatcher {
	dispatchers = {};

	request(path, request, response, ...args) {
		if(this.dispatchers[request.method] instanceof HttpDispatcher) {
			this.dispatchers[request.method].request(path, request, response, ...args);
		}
		else {
			super.request(path, request, response, ...args);
		}
	}

	connect(path, request, socket, head) {
		if(this.dispatchers["CONNECT"] instanceof HttpDispatcher) {
			this.dispatchers["CONNECT"].connect(path, request, socket, head);
		}
		else {
			super.connect(path, request, socket, head);
		}
	}



	setGetDispatcher(dispatcher) {
		if(dispatcher instanceof HttpDispatcher) {
			this.dispatchers["GET"] = dispatcher;
		}
	}
	setHeadDispatcher(dispatcher) {
		if(dispatcher instanceof HttpDispatcher) {
			this.dispatchers["HEAD"] = dispatcher;
		}
	}
	setPostDispatcher(dispatcher) {
		if(dispatcher instanceof HttpDispatcher) {
			this.dispatchers["POST"] = dispatcher;
		}
	}
	setPutDispatcher(dispatcher) {
		if(dispatcher instanceof HttpDispatcher) {
			this.dispatchers["PUT"] = dispatcher;
		}
	}
	setDeleteDispatcher(dispatcher) {
		if(dispatcher instanceof HttpDispatcher) {
			this.dispatchers["DELETE"] = dispatcher;
		}
	}
	setConnectDispatcher(dispatcher) {
		if(dispatcher instanceof HttpDispatcher) {
			this.dispatchers["CONNECT"] = dispatcher;
		}
	}
	setOptionsDispatcher(dispatcher) {
		if(dispatcher instanceof HttpDispatcher) {
			this.dispatchers["OPTIONS"] = dispatcher;
		}
	}
	setTraceDispatcher(dispatcher) {
		if(dispatcher instanceof HttpDispatcher) {
			this.dispatchers["TRACE"] = dispatcher;
		}
	}
	setPatchDispatcher(dispatcher) {
		if(dispatcher instanceof HttpDispatcher) {
			this.dispatchers["PATCH"] = dispatcher;
		}
	}
}


class HttpDirectoryDispatcher extends HttpDispatcher {
	directory;

	constructor(directory) {
		super();
		this.directory = directory;
	}

	cleanFilePath(path) {
		let pathElements = path.split("/");
		let filePath = "";
		for(let ii=0;ii<pathElements.length;++ii) {
			switch(pathElements[ii]) {
				case "..":
					return null;

				case ".":
					continue;

				default:
					filePath += "/"+pathElements[ii];
			}
		}
		return filePath;
	}

	request(path, request, response, ...args) {;
		if(request.method !== "GET") {
			sendStatus(response, 405);
			return;
		}
		let cleanFilePath = this.cleanFilePath(path);
		if(!cleanFilePath) {
			sendStatus(response, 404);
			return;
		}
		serveFile(this.directory + cleanFilePath, response);
	}
}


export {
	HttpDispatcher,
	HttpDispatcherGroup,
	HttpMethodDispatcher,
	HttpDirectoryDispatcher,

	sendStatus,
	sendResult,
};
export default HttpDispatcher;
