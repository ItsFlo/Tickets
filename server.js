import { dirname } from "path";
let bIsWin = process.platform === "win32";
global.__rootpath = dirname(import.meta.url).replace(bIsWin?"file:///":"file://", "");


import http from "http";
import https from "https";
import { readFileSync } from "fs";
import Config from "./modules/Config.js";
import DispatchManager from "./modules/DispatchManager.js";
import TicketConfig from "./tickets/TicketConfig.js";

const oConfig = new Config(JSON.parse(readFileSync(__rootpath+"/config.json")));

TicketConfig.init(oConfig);
DispatchManager.init();


const httpsOptions = {
	key: readFileSync(__rootpath+"/ssl/key.pem"),
	cert: readFileSync(__rootpath+"/ssl/cert.pem"),
};


function getPath(request) {
	let oUrl = new URL(request.url, "https://"+request.headers.host);
	return oUrl.pathname;
}

const ticketServer = https.createServer(httpsOptions);
ticketServer.listen(oConfig.getElement("server.https.port", 443));

ticketServer.on("request", (request, response) => {
	let sPath = getPath(request);
	response.setHeader("Content-Type", "text/plain");
	DispatchManager.dispatchManager.request(sPath, request, response);
});
ticketServer.on("upgrade", (request, socket, head) => {
	let sPath = getPath(request);
	DispatchManager.dispatchManager.upgrade(sPath, request, socket, head);
});
ticketServer.on("connect", (request, socket, head) => {
	let sPath = getPath(request);
	DispatchManager.dispatchManager.connect(sPath, request, socket, head);
});


if(oConfig.getElement("server.http.enable", false)) {
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
	httpServer.listen(oConfig.getElement("server.http.port", 80));
}
