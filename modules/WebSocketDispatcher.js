import HttpDispatcher from "./HttpDispatcher.js";
import { WebSocketServer } from "ws";

function heartBeat() {
	this.isAlive = true;
}

class WebSocketDispatcher extends HttpDispatcher {
	moWs;
	miIntervalID;

	constructor() {
		super();
		this.moWs = new WebSocketServer({
			noServer: true,
		});

		this.miIntervalID = setInterval(() => {
			this.moWs.clients.forEach(ws => {
				if(ws.isAlive === false) {
					ws.terminate();
				}
				else {
					ws.isAlive = false;
					ws.ping();
				}
			});
		}, 30000);
		this.moWs.on("close", () => {
			clearInterval(this.miIntervalID);
		});
	}

	upgrade(sPath, request, socket, head) {
		if(sPath) {
			super.upgrade(sPath, request, socket, head);
			return;
		}

		this.moWs.handleUpgrade(request, socket, head, ws => {
			ws.isAlive = true;
			ws.on("pong", heartBeat);
			this.initWebsocket(ws, request);
		});
	}

	initWebsocket(ws, request) {
		this.moWs.emit("connection", ws, request);
	}

	sendToAll(data, bIsBinary=false) {
		let oOptions = {
			binary: bIsBinary,
		};

		this.moWs.clients.forEach(ws => {
			ws.send(data, oOptions);
		});
		return this;
	}



	addConnectionListener(listener) {
		this.moWs.on("connection", listener);
		return this;
	}
};


export default WebSocketDispatcher;
