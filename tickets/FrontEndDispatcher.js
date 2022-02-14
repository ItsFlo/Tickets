import { HttpDispatcher, HttpDispatcherGroup, HttpDirectoryDispatcher, sendStatus } from "../modules/HttpDispatcher.js";
import { dirname } from "path";
import serveFile from "../modules/ServeFile.js";

const sCurDir = dirname(import.meta.url).replace(process.platform === "win32"? "file:///" : "file://", "");


const oFrontEndDispatcher = new HttpDispatcherGroup();

const oStaticDispatcher = new class extends HttpDispatcher {
	request(sPath, request, response) {
		sPath = sPath.trim().replace(/^\/+|\/+$/g, "");
		let aPathElements = sPath.split("/");

		if(aPathElements.length > 1) {
			sendStatus(response, 404);
			return;
		}

		switch(aPathElements[0].toUpperCase()) {
			case "FAVICON.ICO":
				serveFile(sCurDir+"/favicon.svg", response);
				return;

			case "ADMIN":
				serveFile(sCurDir+"/html/admin.html", response);
				return;

			case "KITCHEN":
				serveFile(sCurDir+"/html/kitchen.html", response);
				return;

			case "CHECKOUT":
				serveFile(sCurDir+"/html/checkout.html", response);
				return;

			default:
				serveFile(sCurDir+"/html/view.html", response);
				return;
		}
	}
}

oFrontEndDispatcher.addDispatcher("", oStaticDispatcher);



const oScriptDispatcher = new HttpDirectoryDispatcher(sCurDir+"/script");
const oStyleDispatcher = new HttpDirectoryDispatcher(sCurDir+"/style");
const oImageDispatcher = new HttpDirectoryDispatcher(sCurDir+"/images");
const oTemplateDispatcher = new HttpDirectoryDispatcher(sCurDir+"/html/templates");

oFrontEndDispatcher.addDispatcher("script", oScriptDispatcher);
oFrontEndDispatcher.addDispatcher("style", oStyleDispatcher);
oFrontEndDispatcher.addDispatcher("image", oImageDispatcher);
oFrontEndDispatcher.addDispatcher("template", oTemplateDispatcher);


export default {
	frontEndDispatcher: oFrontEndDispatcher,
};
