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
		response.setHeader("Cache-Control", "no-cache");
		response.setHeader("Content-Type", "text/event-stream");
		response.writeHead(200);
		response.write(":\n\n");

		response.on("close", () => {
			let iIndex = this.maConnections.indexOf(response);
			this.maConnections.splice(iIndex, 1);
		});
		this.maConnections.push(response);
	}


	closeAllConnections() {
		for(let oConnection of this.maConnections) {
			oConnection.end();
		}
		this.maConnections = [];
		return this;
	}


	formatEvent(sEvent) {
		let iNewLineIndex = sEvent.indexOf("\n");
		if(iNewLineIndex !== -1) {
			sEvent = sEvent.substring(0, iNewLineIndex);
		}
		return "event: " + sEvent;
	}
	formatData(sData) {
		return "data: " + sData.split("\n").join("\ndata: ");
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
		if(!sEventName || typeof sEventName !== "string" || !sData || typeof sData !== "string") {
			return;
		}
		let sMessage = this.formatEvent(sEventName);
		sMessage += "\n" + this.formatData(sData);

		sMessage += "\n\n";
		for(let oConnection of this.maConnections) {
			oConnection.write(sMessage);
		}
	}
};


export default SseDispatcher;
