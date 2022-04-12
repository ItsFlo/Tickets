import { HttpDispatcher, HttpDispatcherGroup, HttpDirectoryDispatcher, sendStatus } from "../modules/HttpDispatcher.js";
import { dirname } from "path";
import serveFile from "../modules/ServeFile.js";
import VenueStyleDispatcher from "./VenueStyleDispatcher.js";

const CUR_DIR = dirname(import.meta.url).replace(process.platform === "win32"? "file:///" : "file://", "");


const frontEndDispatcher = new HttpDispatcherGroup();

const staticDispatcher = new class extends HttpDispatcher {
	request(path, request, response) {
		path = path.trim().replace(/^\/+|\/+$/g, "");
		let pathElements = path.split("/");

		switch(pathElements[0].toUpperCase()) {
			case "FAVICON.ICO":
				serveFile(CUR_DIR+"/favicon.svg", response);
				return;

			case "ADMIN":
				serveFile(CUR_DIR+"/html/admin.html", response);
				return;

			case "STATS":
				serveFile(CUR_DIR+"/html/stats.html", response);
				return;

			case "KITCHEN":
				serveFile(CUR_DIR+"/html/kitchen.html", response);
				return;

			case "CHECKOUT":
				serveFile(CUR_DIR+"/html/checkout.html", response);
				return;

			default:
				if(pathElements.length > 1) {
					sendStatus(response, 404);
					return;
				}

				serveFile(CUR_DIR+"/html/view.html", response);
				return;
		}
	}
}

frontEndDispatcher.addDispatcher("", staticDispatcher);



const scriptDispatcher = new HttpDirectoryDispatcher(CUR_DIR+"/script");
const styleDispatcher = new HttpDirectoryDispatcher(CUR_DIR+"/style");
const imageDispatcher = new HttpDirectoryDispatcher(CUR_DIR+"/images");
const templateDispatcher = new HttpDirectoryDispatcher(CUR_DIR+"/html/templates");

frontEndDispatcher.addDispatcher("script", scriptDispatcher);
frontEndDispatcher.addDispatcher("style", styleDispatcher);
frontEndDispatcher.addDispatcher("image", imageDispatcher);
frontEndDispatcher.addDispatcher("template", templateDispatcher);

frontEndDispatcher.addDispatcher("style/venue", new VenueStyleDispatcher());


export default {
	frontEndDispatcher,
};
