import HttpDispatcher from "../modules/HttpDispatcher.js";
import { dirname } from "path";
import serveFile from "../modules/ServeFile.js";

let sCurDir = dirname(import.meta.url).replace(process.platform === "win32"? "file:///" : "file://", "");


function send404(response) {
	response.setHeader("Cache-Control", "public, max-age=31536000");
	response.writeHead(404);
	response.end();
}

let oFrontEndDispatcher = new HttpDispatcher();

oFrontEndDispatcher.dispatch = function(sPath, request, response) {
	console.log("frontend: ", sPath);
	sPath = sPath.trim().replace(/^\/+|\/+$/g, "");
	let aPathElements = sPath.split("/");

	if(aPathElements.length === 1) {
		let sFilePath = sCurDir+"/html/view.html";
		switch(sPath.toUpperCase()) {
			case "FAVICON.ICO":
				sFilePath = sCurDir+"/favicon.svg";
				break;

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
	else if(aPathElements.length > 1) {
		let sFilePath = sCurDir;
		switch(aPathElements[0].toUpperCase()) {
			case "STYLE":
				sFilePath += "/style";
				break;

			case "SCRIPT":
				sFilePath += "/script";
				break;

			default:
				send404(response);
				return;
		}

		for(let ii=1;ii<aPathElements.length;++ii) {
			switch(aPathElements[ii]) {
				case "..":
					send404(response);
					return;

				case ".":
					continue;

				default:
					sFilePath += "/"+aPathElements[ii];
			}
		}
		serveFile(sFilePath, response);
	}
	else {
		send404(response);
	}
}


export default {
	frontEndDispatcher: oFrontEndDispatcher,
};
