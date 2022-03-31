class Config {
	config = {};

	constructor(config) {
		switch(typeof config) {
		case "undefined":
			break;
		case "object":
			this.config = config;
			break;

		default:
			throw new Error("oConfig must be an object");
		}
	}



	getConfigArray() {
		return this.config;
	}

	splitPath(path) {
		if(typeof path !== "string" || !path) {
			return null;
		}
		let pathElements = path.split(".");

		let len = pathElements.length;
		for(let ii=0;ii<len;++ii) {
			if(!pathElements[ii]) {
				return null;
			}
		}

		return pathElements;
	}


	setElement(path, value) {
		let pathElements = this.splitPath(path);
		if(pathElements === null) {
			return false;
		}

		let len = pathElements.length - 1;
		let lastElement = pathElements[len];

		let configElement = this.config;
		for(let ii=0;ii<len;++ii) {
			let elementName = pathElements[ii];

			if(configElement.hasOwnProperty(elementName)) {
				if(typeof configElement === "object") {
					configElement = configElement[elementName];
				}
				else {
					return false;
				}
			}
			else {
				configElement[elementName] = {};
				configElement = configElement[elementName];
			}
		}

		configElement[lastElement] = value;
		return true;
	}
	removeElement(path) {
		let pathElements = this.splitPath(path);
		if(pathElements === null) {
			return false;
		}

		let len = pathElements.length - 1;
		let lastElement = pathElements[len];

		let configElement = this.config;
		for(let ii=0;ii<len;++ii) {
			let elementName = pathElements[ii];

			if(configElement.hasOwnProperty(elementName)) {
				if(typeof configElement === "object") {
					configElement = configElement[elementName];
				}
				else {
					return true;
				}
			}
			else {
				return true;
			}
		}

		delete configElement[lastElement];
		return true;
	}
	getElement(path, fallbackReturnValue=null) {
		let pathElements = this.splitPath(path);
		if(pathElements === null) {
			return fallbackReturnValue;
		}

		let configElement = this.config;
		let len = pathElements.length;
		for(let ii=0; ii<len; ++ii) {
			let elementName = pathElements[ii];
			if(configElement.hasOwnProperty(elementName)) {
				configElement = configElement[elementName];
			}
			else {
				return fallbackReturnValue;
			}
		}
		return configElement;
	}
	hasElement(path) {
		let testObject = {};
		return this.getElement(path, testObject) !== testObject;
	}

	addConfig(path, config) {
		if(!(config instanceof Config)) {
			return false;
		}
		let pathElements = this.splitPath(path);
		if(pathElements === null) {
			return false;
		}

		let len = pathElements.length - 1;
		let lastElement = pathElements[len];

		let configElement = this.config;
		for(let ii=0;ii<len;++ii) {
			let elementName = pathElements[ii];

			if(configElement.hasOwnProperty(elementName)) {
				if(typeof configElement === "object") {
					configElement = configElement[elementName];
				}
				else {
					return false;
				}
			}
			else {
				configElement[elementName] = {};
				configElement = configElement[elementName];
			}
		}

		configElement[lastElement] = config.getConfigArray();
		return true;
	}
	getElementAsConfig(path) {
		let pathElements = this.splitPath(path);
		if(pathElements === null) {
			return new Config();
		}

		let configElement = this.config;
		let len = pathElements.length;
		for(let ii=0; ii<len; ++ii) {
			let elementName = pathElements[ii];
			if(configElement.hasOwnProperty(elementName)) {
				configElement = configElement[elementName];
			}
			else {
				return new Config();
			}
		}

		if(typeof configElement === "object") {
			return new Config(configElement);
		}
		return new Config();
	}
}


export default Config;
