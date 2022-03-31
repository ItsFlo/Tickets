import { dirname } from "path";
let isWindows = process.platform === "win32";
global.__rootpath = dirname(import.meta.url).replace(isWindows?"file:///":"file://", "");


import http from "http";
import https from "https";
import { readFileSync } from "fs";
import Config from "./modules/Config.js";
import DispatchManager from "./modules/DispatchManager.js";
import TicketConfig from "./tickets/TicketConfig.js";

const CONFIG = new Config(JSON.parse(readFileSync(__rootpath+"/config.json")));

TicketConfig.init(CONFIG);
DispatchManager.init();


const httpsOptions = {
	key: readFileSync(__rootpath+"/ssl/key.pem"),
	cert: readFileSync(__rootpath+"/ssl/cert.pem"),
};


function getPath(request) {
	let url = new URL(request.url, "https://"+request.headers.host);
	return url.pathname;
}

const ticketServer = https.createServer(httpsOptions);
ticketServer.listen(CONFIG.getElement("server.https.port", 443));

ticketServer.on("request", (request, response) => {
	let path = getPath(request);
	response.setHeader("Content-Type", "text/plain");
	DispatchManager.dispatchManager.request(path, request, response);
});
ticketServer.on("upgrade", (request, socket, head) => {
	let path = getPath(request);
	DispatchManager.dispatchManager.upgrade(path, request, socket, head);
});
ticketServer.on("connect", (request, socket, head) => {
	let path = getPath(request);
	DispatchManager.dispatchManager.connect(path, request, socket, head);
});


if(CONFIG.getElement("server.http.enable", false)) {
	const httpServer = http.createServer((request, response) => {
		if(request.headers.upgrade === "websocket") {
			response.writeHead(301, {
				"Location": "wss://"+request.headers.host+request.url,
			});
		}
		else {
			response.writeHead(301, {
				"Location": "https://"+request.headers.host+request.url,
			});
		}
		response.end();
	});
	httpServer.listen(CONFIG.getElement("server.http.port", 80));
}
