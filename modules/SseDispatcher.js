import HttpDispatcher from "./HttpDispatcher.js";

class SseDispatcher extends HttpDispatcher {
	maConnections = [];

	request(sPath, request, response, ...args) {
		if(sPath) {
			super.request(sPath, request, response, ...args);
			return;
		}
		if(request.headers.accept !== "text/event-stream") {
			response.writeHead(400);
			response.end();
			return;
		}
		this.initConnection(response);
		response.on("close", () => {
			let iIndex = this.maConnections.indexOf(response);
			if(iIndex > -1) {
				this.maConnections.splice(iIndex, 1);
			}
		});

		this.maConnections.push(response);
	}
	initConnection(response) {
		response.setHeader("Cache-Control", "no-cache");
		response.setHeader("Content-Type", "text/event-stream");
		response.writeHead(200);
		response.write(":\n\n");
	}


	closeAllConnections() {
		for(let oConnection of this.maConnections) {
			oConnection.end();
		}
		this.maConnections = [];
		return this;
	}


	formatEvent(sEventName) {
		let iNewLineIndex = sEventName.indexOf("\n");
		if(iNewLineIndex !== -1) {
			sEventName = sEventName.substring(0, iNewLineIndex);
		}
		return "event: " + sEventName;
	}
	formatData(sData) {
		return "data: " + sData.split("\n").join("\ndata: ");
	}
	formatMessage(sEventName, sData) {
		let sMessage = this.formatEvent(sEventName);
		sMessage += "\n" + this.formatData(sData);
		sMessage += "\n\n";
		return sMessage;
	}

	send(sData) {
		if(!sData || typeof sData !== "string") {
			return;
		}
		let sMessage = this.formatData(sData);

		sMessage += "\n\n";
		for(let oConnection of this.maConnections) {
			oConnection.write(sMessage);
		}
	}
	sendEvent(sEventName, sData) {
		if(!sEventName || typeof sEventName !== "string" || !sData) {
			return;
		}
		if(typeof sData !== "string") {
			try {
				sData = JSON.stringify(sData);
			} catch (err) {
				return;
			}
			if(!sData) {
				return;
			}
		}

		let sMessage = this.formatMessage(sEventName, sData);
		for(let oConnection of this.maConnections) {
			oConnection.write(sMessage);
		}
	}
};


export default SseDispatcher;
