import { dirname } from "path";
let bIsWin = process.platform === "win32";
global.__rootpath = dirname(import.meta.url).replace(bIsWin?"file:///":"file://", "");


import http from "http";
import https from "https";
import { readFileSync } from "fs";
import Config from "./modules/Config.js";
import DispatchManager from "./modules/DispatchManager.js";

const oConfig = new Config(JSON.parse(readFileSync(__rootpath+"/config.json")));

DispatchManager.init(oConfig);


const httpsOptions = {
	key: readFileSync(__rootpath+"/ssl/key.pem"),
	cert: readFileSync(__rootpath+"/ssl/cert.pem"),
};


function requestListener(request, response) {
	let oUrl = new URL(request.url, "https://"+request.headers.host);
	let sPath = oUrl.pathname;

	DispatchManager.dispatchManager.dispatch(sPath, request, response);
}

const ticketServer = https.createServer(httpsOptions, requestListener);
ticketServer.listen(oConfig.getElement("server.https.port", 443));

if(oConfig.getElement("server.http.enable", false)) {
	const httpServer = http.createServer(function(request, response) {
		response.writeHead(301, {
			"Location": "https://"+request.headers.host+request.url,
		});
		response.end();
	});
	httpServer.listen(oConfig.getElement("server.http.port", 80));
}
