const HTTP_STATUS_CODES = {
	//1xx
	100: "Continue",
	101: "Switching Protocols",
	102: "Processing",
	103: "Early Hints",

	//2xx
	200: "OK",
	201: "Created",
	202: "Accepted",
	203: "Non-Authoritative Information",
	204: "No Content",
	205: "Reset Content",
	206: "Partial Content",
	207: "Multi-Status",
	208: "Already Reported",
	226: "IM Used",

	//3xx
	300: "Multiple Choice",
	301: "Moved Permanently",
	302: "Found",
	303: "See Other",
	304: "Not Modified",
	305: "Use Proxy",
	306: "Switch Proxy",
	307: "Temporary Redirect",
	308: "Permanent Redirect",

	//4xx
	400: "Bad Request",
	401: "Unauthorized",
	402: "Payment Required",
	403: "Forbidden",
	404: "Not Found",
	405: "Method Not Allowed",
	406: "Not Acceptable",
	407: "Proxy Authentication Required",
	408: "Request Timeout",
	409: "Conflict",
	410: "Gone",
	411: "Length Required",
	412: "Precondition Failed",
	413: "Payload Too Large",
	414: "URI Too Long",
	415: "Unsupported Media Type",
	416: "Requested Range Not Satisfiable",
	417: "Expectation Failed",
	418: "I´m a teapot",
	421: "Misdirected Request",
	422: "Unprocessable Entity",
	423: "Locked",
	424: "Failed Dependency",
	425: "Too Early",
	426: "Upgrade Required",
	428: "Precondition Required",
	429: "Too Many Requests",
	431: "Request Header Fields Too Large",
	451: "Unavailable For Legal Reasons",

	//5xx
	500: "Internal Server Error",
	501: "Not Implemented",
	502: "Bad Gateway",
	503: "Service Unavailable",
	504: "Gateway Timeout",
	505: "HTTP Version Not Supported",
	506: "Variant Also Negotiates",
	507: "Insufficient Storage",
	508: "Loop Detected",
	510: "Not Extended",
	511: "Network Authentication Required",
};

function getHttpStatusMessage(iStatus) {
	if(iStatus === 0) {
		return "Übertragung abgebrochen";
	}

	if(HTTP_STATUS_CODES.hasOwnProperty(iStatus)) {
		return HTTP_STATUS_CODES[iStatus];
	}
	return null;
}


function createUrl(url, params) {
	let getParameters = [];
	for(let index in params) {
		let index_encoded = encodeURIComponent(index);
		let value = params[index];
		if(Array.isArray(value)) {
			for(let val of value) {
				getParameters.push(index_encoded + "=" + encodeURIComponent(val));
			}
		}
		else {
			getParameters.push(index_encoded + "=" + encodeURIComponent(value));
		}
	}

	if(!getParameters.length) {
		return url;
	}
	return url + "?" + getParameters.join("&");
}


const GET = "GET";
const HEAD = "HEAD";
const POST = "POST";
const PUT = "PUT";
const DELETE = "DELETE";
const CONNECT = "CONNECT";
const OPTIONS = "OPTIONS";
const TRACE = "TRACE";
const PATCH = "PATCH";
const AJAX_METHODS = [
	GET,
	HEAD,
	POST,
	PUT,
	DELETE,
	CONNECT,
	OPTIONS,
	TRACE,
	PATCH,
];

const AJAX_METHODS_WITH_BODY = [
	POST,
	PUT,
	DELETE,
	PATCH,
];
const AJAX_METHODS_WITHOUT_BODY = [
	GET,
	HEAD,
	CONNECT,
	OPTIONS,
	TRACE,
];


class HttpError extends Error {
	constructor(httpStatusCode, message=null) {
		super(message===null? getHttpStatusMessage(httpStatusCode) : message);
		this.httpStatus = httpStatusCode;
		this.aborted = httpStatusCode === 0;
	}
}
class AjaxRequest {
	constructor(sMethod) {
		if(!AJAX_METHODS.includes(sMethod)) {
			sMethod = GET;
		}
		this.method = sMethod;
		this._sending = false;

		this._successListeners = [];
		this._errorListeners = [];
		this._progressListeners = [];

		let oXmlhttp;
		if(window.XMLHttpRequest) {
			oXmlhttp = new XMLHttpRequest();
		} else {
			oXmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
		}

		this._xmlHttp = oXmlhttp;
		this._xmlHttp.upload.addEventListener("progress", event => this.callProgressListeners(event));
		this._xmlHttp.addEventListener("readystatechange", () => {
			switch(this._xmlHttp.readyState) {
				case 0:
					let oError = new HttpError(0);
					this.callErrorListeners(oError, null);
					this._sending = false;
					break;

				case 4:
					if(this._xmlHttp.status >= 200 && this._xmlHttp.status < 300) {
						let bSuccess = true;
						let oJson;
						let sError = "";
						if(this._xmlHttp.getResponseHeader("Content-Type") === "application/json") {
							try {
								oJson = JSON.parse(this._xmlHttp.responseText);
							} catch(err) {
								oJson = null;
								bSuccess = false;
								sError = "JSON error: " + err.message;
							}
						}

						if(bSuccess) {
							this.callSuccessListeners(oJson, this._xmlHttp.responseText);
						}
						else {
							this.callErrorListeners(sError, this._xmlHttp.responseText);
						}
					}
					else {
						let oError;
						if(this._xmlHttp.status === 0) {
							oError = new HttpError(0);
						}
						else if(this._xmlHttp.responseText) {
							oError = new HttpError(this._xmlHttp.status, this._xmlHttp.responseText);
						}
						else {
							let sErrorMessage = getHttpStatusMessage(this._xmlHttp.status) || "Übertragung fehlgeschlagen";
							oError = new HttpError(this._xmlHttp.status, sErrorMessage);
						}
						this.callErrorListeners(oError, this._xmlHttp.responseText);
					}
					this._sending = false;
					break;
			}
		});
	}

	open(sUrl, sUser=null, sPassword=null) {
		this.clearSuccessListeners();
		this.clearErrorListeners();
		this._xmlHttp.open(this.method, sUrl, true, sUser, sPassword);
		return this;
	}
	setUrlEncoded() {
		this._xmlHttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		return this;
	}
	setJsonEncoded() {
		this._xmlHttp.setRequestHeader("Content-type", "application/json");
		return this;
	}


	addSuccessListener(listener) {
		if(!this._successListeners.includes(listener)) {
			this._successListeners.push(listener);
		}
		return this;
	}
	removeSuccessListener(listener) {
		let iIndex = this._successListeners.indexOf(listener);
		if(iIndex > -1) {
			this._successListeners.splice(iIndex, 1);
		}
		return this;
	}
	clearSuccessListeners() {
		this._successListeners = [];
		return this;
	}

	addErrorListener(listener) {
		if(!this._errorListeners.includes(listener)) {
			this._errorListeners.push(listener);
		}
		return this;
	}
	removeErrorListener(listener) {
		let iIndex = this._errorListeners.indexOf(listener);
		if(iIndex > -1) {
			this._errorListeners.splice(iIndex, 1);
		}
		return this;
	}
	clearErrorListeners() {
		this._errorListeners = [];
		return this;
	}

	addProgressListener(listener) {
		if(!this._progressListeners.includes(listener)) {
			this._progressListeners.push(listener);
		}
		return this;
	}
	removeProgressListener(listener) {
		let iIndex = this._progressListeners.indexOf(listener);
		if(iIndex > -1) {
			this._progressListeners.splice(iIndex, 1);
		}
		return this;
	}
	clearProgressListeners() {
		this._progressListeners = [];
		return this;
	}

	callSuccessListeners(json, text) {
		for(let listener of this._successListeners) {
			listener.call(this, json, text);
		}
		if(typeof this._resolve === "function") {
			this._resolve({
				json: json,
				text: text,
			});
			this._resolve = null;
			this._reject = null;
		}
		return this;
	}
	callErrorListeners(error, text) {
		if(typeof error === "string") {
			error = new Error(error);
		}
		error.responseText = text;

		for(let listener of this._successListeners) {
			listener.call(this, error, text);
		}
		if(typeof this._reject === "function") {
			this._reject(error);
			this._resolve = null;
			this._reject = null;
		}
		return this;
	}
	callProgressListeners(event) {
		for(let listener of this._progressListeners) {
			listener.call(this, event);
		}
		return this;
	}


	send(data) {
		if(this._sending) {
			return null;
		}
		this._sending = true;
		let promise = new Promise((resolve, reject) => {
			this._resolve = resolve;
			this._reject = reject;

			this._xmlHttp.send(data);
		});
		promise.request = this;
		return promise;
	}
	abort() {
		this._xmlHttp.abort();
	}
};

function send(url, method=GET, data=undefined) {
	let ajax = new AjaxRequest(method);
	ajax.open(url);
	return ajax.send(data);
}
function sendJson(url, method=GET, data={}) {
	let ajax = new AjaxRequest(method);
	ajax.open(url);
	ajax.setJsonEncoded();
	return ajax.send(JSON.stringify(data));
}


export default {
	Request: AjaxRequest,
	HttpError,

	send,
	sendJson,

	HTTP_STATUS_CODES,
	getHttpStatusMessage,
	createUrl,

	GET,
	HEAD,
	POST,
	PUT,
	DELETE,
	CONNECT,
	OPTIONS,
	TRACE,
	PATCH,

	AJAX_METHODS,
	AJAX_METHODS_WITH_BODY,
	AJAX_METHODS_WITHOUT_BODY,
};
