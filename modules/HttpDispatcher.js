class HttpDispatcher {
	request(sPath, request, response) {
		response.writeHead(404);
		response.end();
	}

	upgrade(sPath, request, socket, head) {
		socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
		socket.destroy();
	}

	connect(sPath, request, socket, head) {
		socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
		socket.destroy();
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

		let sPathCopy = sPath;
		if(!this.mbCaseSensitive) {
			sPathCopy = sPathCopy.toUpperCase();
		}
		let aPathElements = this.splitPath(sPathCopy);
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
		if(oDispatcherParent.hasOwnProperty(aPathElements[iLen]) && oDispatcherParent[aPathElements[iLen]] instanceof HttpDispatcher) {
			return {
				dispatcher: oDispatcherParent[aPathElements[iLen]],
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


export { HttpDispatcher, HttpDispatcherGroup, HttpMethodDispatcher };
export default HttpDispatcher;
