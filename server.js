import { dirname } from "path";
let isWindows = process.platform === "win32";
global.__rootpath = dirname(import.meta.url).replace(isWindows?"file:///":"file://", "");


import http from "http";
import https from "https";
import { readFileSync } from "fs";
import Config from "./modules/Config.js";
import DispatchManager from "./modules/DispatchManager.js";
import TicketConfig from "./tickets/TicketConfig.js";

function requestListener(request, response) {
	let path = getPath(request);
	response.setHeader("Content-Type", "text/plain");
	DispatchManager.dispatchManager.request(path, request, response);
}
function upgradeListener(request, socket, head) {
	let path = getPath(request);
	DispatchManager.dispatchManager.upgrade(path, request, socket, head);
}
function connectListener(request, socket, head) {
	let path = getPath(request);
	DispatchManager.dispatchManager.connect(path, request, socket, head);
}


function getPath(request) {
	let url = new URL(request.url, "https://"+request.headers.host);
	return url.pathname;
}



function init() {
	TicketConfig.init(CONFIG);
	DispatchManager.init();
}

function startServers() {
	const httpsPort = CONFIG.getElement("server.https.port", 443);
	if(CONFIG.getElement("server.https.enable", true)) {
		const httpsOptions = {
			key: readFileSync(__rootpath+"/ssl/key.pem"),
			cert: readFileSync(__rootpath+"/ssl/cert.pem"),
		};
	
		const ticketServer = https.createServer(httpsOptions);
		ticketServer.on("request", requestListener);
		ticketServer.on("upgrade", upgradeListener);
		ticketServer.on("connect", connectListener);
	
		ticketServer.listen(httpsPort);
	}
	
	
	if(CONFIG.getElement("server.http.enable", true)) {
		const httpServer = http.createServer();
		if(CONFIG.getElement("server.http.redirectToHttps", true)) {
			httpServer.on("request", (request, response) => {
				let host = request.headers.host;
				let hostParts = host.split(":");
				if(hostParts.length === 2) {
					host = hostParts[0];
				}
				if(httpsPort !== 443) {
					host += ":" + httpsPort;
				}
	
				if(request.headers.upgrade === "websocket") {
					response.writeHead(301, {
						"Location": "wss://"+host+request.url,
					});
				}
				else {
					response.writeHead(301, {
						"Location": "https://"+host+request.url,
					});
				}
				response.end();
			});
		}
		else {
			httpServer.on("request", requestListener);
			httpServer.on("upgrade", upgradeListener);
			httpServer.on("connect", connectListener);
		}
	
		httpServer.listen(CONFIG.getElement("server.http.port", 80));
	}
}


const CONFIG = new Config(JSON.parse(readFileSync(__rootpath+"/config.json")));
if(CONFIG.getElement("server.https.enable", true) || CONFIG.getElement("server.http.enable", true)) {
	init();
	startServers();
}
