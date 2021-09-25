class HttpDispatcher {
	dispatch(sPath, request, response) {
		response.writeHead(404);
		response.end();
	}
};


class HttpDispatcherGroup extends HttpDispatcher {
	moDispatchers = {};
	moFallbackDispatcher = null;
	mbCaseSensitive;

	constructor(bCaseSensitive=false) {
		super();
		this.mbCaseSensitive = !!bCaseSensitive;
	}

	setFallbackDispatcher(oDispatcher) {
		this.moFallbackDispatcher = (oDispatcher instanceof HttpDispatcher? oDispatcher : null);
		return this;
	}
	dispatchFallback(sPath, request, response) {
		if(this.moFallbackDispatcher instanceof HttpDispatcher) {
			this.moFallbackDispatcher.dispatch(sPath, request, response);
		}
		else {
			super.dispatch(sPath, request, response);
		}
		return this;
	}



	dispatch(sPath, request, response) {
		if(typeof sPath !== "string") {
			this.dispatchFallback(sPath, request, response);
			return;
		}

		let sPathCopy = sPath;
		if(!this.mbCaseSensitive) {
			sPathCopy = sPathCopy.toUpperCase();
		}
		let aPathElements = this.splitPath(sPathCopy);
		if(!aPathElements) {
			this.dispatchFallback("", request, response);
			return;
		}

		let iLen = aPathElements.length - 1;
		let oDispatcherParent = this.moDispatchers;
		for(let ii=0;ii<iLen;++ii) {
			let sIndex = aPathElements[ii];
			if(!oDispatcherParent.hasOwnProperty(sIndex)) {
				if(!ii && this.moDispatchers.hasOwnProperty("/")) {
					this.moDispatchers["/"].dispatch(sPath, request, response);
				}
				else {
					this.dispatchFallback(sPath, request, response);
				}
				return;
			}
			oDispatcherParent = oDispatcherParent[sIndex];

			if(oDispatcherParent instanceof HttpDispatcher) {
				let sNewPath = aPathElements[ii+1];
				for(let kk=ii+2;kk<=iLen;++kk) {
					sNewPath += "/"+aPathElements[kk];
				}
				oDispatcherParent.dispatch(sNewPath, request, response);
				return;
			}
		}
		if(oDispatcherParent.hasOwnProperty(aPathElements[iLen]) && oDispatcherParent[aPathElements[iLen]] instanceof HttpDispatcher) {
			oDispatcherParent[aPathElements[iLen]].dispatch("", request, response);;
			return;
		}

		if(this.moDispatchers.hasOwnProperty("/")) {
			this.moDispatchers["/"].dispatch(sPath, request, response);
		}
		else {
			this.dispatchFallback(sPath, request, response);
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
}


class HttpMethodDispatcher extends HttpDispatcher {
	moDispatchers = {};

	dispatch(sPath, request, response) {
		if(this.moDispatchers.hasOwnProperty(request.method) && this.moDispatchers[request.method] instanceof HttpDispatcher) {
			this.moDispatchers[request.method].dispatch(sPath, request, response);
		}
		else {
			super.dispatch(sPath, request, response);
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
