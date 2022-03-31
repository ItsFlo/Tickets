import HttpDispatcher, { sendStatus } from "./HttpDispatcher.js";

class SseDispatcher extends HttpDispatcher {
	connections = [];

	request(path, request, response, ...args) {
		if(path) {
			super.request(path, request, response, ...args);
			return;
		}
		if(request.headers.accept !== "text/event-stream") {
			sendStatus(response, 400);
			return;
		}
		this.initConnection(response);
		response.on("close", () => {
			let index = this.connections.indexOf(response);
			if(index > -1) {
				this.connections.splice(index, 1);
			}
		});

		this.connections.push(response);
	}
	initConnection(response) {
		response.setHeader("Cache-Control", "no-cache");
		response.setHeader("Content-Type", "text/event-stream");
		response.writeHead(200);
		response.write(":\n\n");
	}


	closeAllConnections() {
		for(let connection of this.connections) {
			connection.end();
		}
		this.connections = [];
		return this;
	}


	formatEvent(eventName) {
		let newLineIndex = eventName.indexOf("\n");
		if(newLineIndex !== -1) {
			eventName = eventName.substring(0, newLineIndex);
		}
		return "event: " + eventName;
	}
	formatData(data) {
		return "data: " + data.split("\n").join("\ndata: ");
	}
	formatMessage(eventName, data) {
		let sMessage = this.formatEvent(eventName);
		sMessage += "\n" + this.formatData(data);
		sMessage += "\n\n";
		return sMessage;
	}

	send(data) {
		if(!data || typeof data !== "string") {
			return;
		}
		let message = this.formatData(data);

		message += "\n\n";
		for(let connection of this.connections) {
			connection.write(message);
		}
	}
	sendEvent(eventName, data) {
		if(!eventName || typeof eventName !== "string" || !data) {
			return;
		}
		if(typeof data !== "string") {
			try {
				data = JSON.stringify(data);
			} catch (err) {
				return;
			}
			if(!data) {
				return;
			}
		}

		let message = this.formatMessage(eventName, data);
		for(let connection of this.connections) {
			connection.write(message);
		}
	}
};


export default SseDispatcher;
