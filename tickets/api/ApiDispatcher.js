import { HttpDispatcherGroup } from "../../modules/HttpDispatcher.js";
import Ajax from "../script/api/Ajax.js";
import oVenueDispatcher from "./VenueDispatcher.js";
import oItemCategoryDispatcher from "./ItemCategoryDispatcher.js";
import oItemDispatcher from "./ItemDispatcher.js";
import oOrderDispatcher from "./OrderDispatcher.js";

let oApiDispatcher = new class extends HttpDispatcherGroup {
	request(sPath, request, response) {
		response.setHeader("Cache-Control", "no-store");
		if(request.headers["content-type"] !== "application/json") {
			response.writeHead(400);
			response.end("Content-Type 'application/json' expected");
			return;
		}

		if(Ajax.AJAX_METHODS_WITH_BODY.includes(request.method)) {
			let sRequestBody = "";
			request.on("data", (chunk) => sRequestBody += chunk);
			request.on("end", () => {
				try {
					let oJson = JSON.parse(sRequestBody);
					super.request(sPath, request, response, oJson);
				} catch(err) {
					response.writeHead(400);
					response.end("JSON error");
				}
			});
		}
		else {
			super.request(sPath, request, response, {});
		}
	}
}(false);

oApiDispatcher.addDispatcher("venue", oVenueDispatcher);
oApiDispatcher.addDispatcher("item", oItemDispatcher);
oApiDispatcher.addDispatcher("itemCategory", oItemCategoryDispatcher);
oApiDispatcher.addDispatcher("order", oOrderDispatcher);



function init() {

}

export default {
	init,
	apiDispatcher: oApiDispatcher,
};
