import HttpDispatcher from "../modules/HttpDispatcher.js";
import { dirname } from "path";
import serveFile from "../modules/ServeFile.js";

let sCurDir = dirname(import.meta.url).replace(process.platform === "win32"? "file:///" : "file://", "");


let oFrontEndDispatcher = new HttpDispatcher();

oFrontEndDispatcher.dispatch = function(sPath, request, response) {
	console.log("frontend: ", sPath);
	sPath = sPath.trim().replace(/^\/+|\/+$/g, "").toUpperCase();
	let aPathElements = sPath.split("/");

	if(aPathElements.length === 1) {
		let sFilePath = sCurDir+"/html/view.html";
		switch(sPath) {
			case "FAVICON.ICO":
				response.setHeader("Cache-Control", "public, max-age=86400");
				response.writeHead(404);
				response.end();
				return;

			case "ADMIN":
				sFilePath = sCurDir+"/html/admin.html";
				break;

			case "KITCHEN":
				sFilePath = sCurDir+"/html/kitchen.html";
				break;

			case "CHECKOUT":
				sFilePath = sCurDir+"/html/checkout.html";
				break;
		}
		serveFile(sFilePath, response);
	}
	else if(aPathElements.length === 2) {
		let sFilePath = sCurDir;
		switch(aPathElements[0]) {
			case "STYLE":
				sFilePath += "/style/"+aPathElements[1];
				serveFile(sFilePath, response);
				break;

			case "SCRIPT":
				sFilePath += "/script/"+aPathElements[1];
				serveFile(sFilePath, response);
				break;

			default:
				response.setHeader("Cache-Control", "public, max-age=86400");
				response.writeHead(404);
				response.end();
				break;
		}
	}
	else {
		response.setHeader("Cache-Control", "public, max-age=86400");
		response.writeHead(404);
		response.end();
	}
}


export default {
	frontEndDispatcher: oFrontEndDispatcher,
};
