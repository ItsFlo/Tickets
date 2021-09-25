class Config {
	moConfig = {};

	constructor(oConfig) {
		switch(typeof oConfig) {
		case "undefined":
			break;
		case "object":
			this.moConfig = oConfig;
			break;

		default:
			throw new Error("oConfig must be an object");
		}
	}



	getConfigArray() {
		return this.moConfig;
	}

	splitPath(sPath) {
		if(typeof sPath !== "string" || !sPath) {
			return null;
		}
		var aPathElements = sPath.split(".");

		var iLen = aPathElements.length;
		for(var ii=0;ii<iLen;++ii) {
			if(!aPathElements[ii]) {
				return null;
			}
		}

		return aPathElements;
	}


	setElement(sPath, value) {
		var aPathElements = this.splitPath(sPath);
		if(aPathElements === null) {
			return false;
		}

		var iLen = aPathElements.length - 1;
		var sLastElement = aPathElements[iLen];

		var oConfigElement = this.moConfig;
		for(var ii=0;ii<iLen;++ii) {
			var sElementName = aPathElements[ii];

			if(oConfigElement.hasOwnProperty(sElementName)) {
				if(typeof oConfigElement === "object") {
					oConfigElement = oConfigElement[sElementName];
				}
				else {
					return false;
				}
			}
			else {
				oConfigElement[sElementName] = {};
				oConfigElement = oConfigElement[sElementName];
			}
		}

		oConfigElement[sLastElement] = value;
		return true;
	}
	removeElement(sPath) {
		var aPathElements = this.splitPath(sPath);
		if(aPathElements === null) {
			return false;
		}

		var iLen = aPathElements.length - 1;
		var sLastElement = aPathElements[iLen];

		var oConfigElement = this.moConfig;
		for(var ii=0;ii<iLen;++ii) {
			var sElementName = aPathElements[ii];

			if(oConfigElement.hasOwnProperty(sElementName)) {
				if(typeof oConfigElement === "object") {
					oConfigElement = oConfigElement[sElementName];
				}
				else {
					return true;
				}
			}
			else {
				return true;
			}
		}

		delete oConfigElement[sLastElement];
		return true;
	}
	getElement(sPath, fallbackReturnValue=null) {
		var aPathElements = this.splitPath(sPath);
		if(aPathElements === null) {
			return fallbackReturnValue;
		}

		var oConfigElement = this.moConfig;
		var iLen = aPathElements.length;
		for(var ii=0; ii<iLen; ++ii) {
			var sElementName = aPathElements[ii];
			if(oConfigElement.hasOwnProperty(sElementName)) {
				oConfigElement = oConfigElement[sElementName];
			}
			else {
				return fallbackReturnValue;
			}
		}
		return oConfigElement;
	}
	hasElement(sPath) {
		let oTestObject = {};
		return this.getElement(sPath, oTestObject) !== oTestObject;
	}

	addConfig(sPath, oConfig) {
		if(!(oConfig instanceof Config)) {
			return false;
		}
		var aPathElements = this.splitPath(sPath);
		if(aPathElements === null) {
			return false;
		}

		var iLen = aPathElements.length - 1;
		var sLastElement = aPathElements[iLen];

		var oConfigElement = this.moConfig;
		for(var ii=0;ii<iLen;++ii) {
			var sElementName = aPathElements[ii];

			if(oConfigElement.hasOwnProperty(sElementName)) {
				if(typeof oConfigElement === "object") {
					oConfigElement = oConfigElement[sElementName];
				}
				else {
					return false;
				}
			}
			else {
				oConfigElement[sElementName] = {};
				oConfigElement = oConfigElement[sElementName];
			}
		}

		oConfigElement[sLastElement] = oConfig.getConfigArray();
		return true;
	}
	getElementAsConfig(sPath) {
		var aPathElements = this.splitPath(sPath);
		if(aPathElements === null) {
			return new Config();
		}

		var oConfigElement = this.moConfig;
		var iLen = aPathElements.length;
		for(var ii=0; ii<iLen; ++ii) {
			var sElementName = aPathElements[ii];
			if(oConfigElement.hasOwnProperty(sElementName)) {
				oConfigElement = oConfigElement[sElementName];
			}
			else {
				return new Config();
			}
		}

		if(typeof oConfigElement === "object") {
			return new Config(oConfigElement);
		}
		return new Config();
	}
}


export default Config;
