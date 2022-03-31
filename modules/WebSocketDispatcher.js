import HttpDispatcher from "./HttpDispatcher.js";
import { WebSocketServer } from "ws";

function heartBeat() {
	this.isAlive = true;
}

class WebSocketDispatcher extends HttpDispatcher {
	ws;
	intervalID;

	constructor() {
		super();
		this.ws = new WebSocketServer({
			noServer: true,
		});

		this.intervalID = setInterval(() => {
			this.ws.clients.forEach(ws => {
				if(ws.isAlive === false) {
					ws.terminate();
				}
				else {
					ws.isAlive = false;
					ws.ping();
				}
			});
		}, 30000);
		this.ws.on("close", () => {
			clearInterval(this.intervalID);
		});
	}

	upgrade(path, request, socket, head) {
		if(path) {
			super.upgrade(path, request, socket, head);
			return;
		}

		this.ws.handleUpgrade(request, socket, head, ws => {
			ws.isAlive = true;
			ws.on("pong", heartBeat);
			this.initWebsocket(ws, request);
		});
	}

	initWebsocket(ws, request) {
		this.ws.emit("connection", ws, request);
	}

	sendToAll(data, binary=false) {
		let oOptions = {
			binary: binary,
		};

		this.ws.clients.forEach(ws => {
			ws.send(data, oOptions);
		});
		return this;
	}



	addConnectionListener(listener) {
		this.ws.on("connection", listener);
		return this;
	}
};


export default WebSocketDispatcher;
