import { HttpDispatcherGroup, sendStatus } from "../../modules/HttpDispatcher.js";
import Ajax from "../script/Ajax.js";
import venueDispatcher from "./VenueDispatcher.js";
import itemCategoryDispatcher from "./ItemCategoryDispatcher.js";
import itemDispatcher from "./ItemDispatcher.js";
import orderDispatcher from "./OrderDispatcher.js";
import orderItemDispatcher from "./OrderItemDispatcher.js";

let apiDispatcher = new class extends HttpDispatcherGroup {
	request(path, request, response) {
		response.setHeader("Cache-Control", "no-store");

		if(Ajax.AJAX_METHODS_WITH_BODY.includes(request.method)) {
			if(request.headers["content-type"] !== "application/json") {
				sendStatus(response, 400, "Content-Type 'application/json' expected");
				return;
			}

			let requestBody = "";
			request.on("data", (chunk) => requestBody += chunk);
			request.on("end", () => {
				try {
					let oJson = JSON.parse(requestBody);
					super.request(path, request, response, oJson);
				} catch(err) {
					sendStatus(response, 400, "JSON error");
				}
			});
		}
		else {
			super.request(path, request, response, {});
		}
	}
}(false);

apiDispatcher.addDispatcher("venue", venueDispatcher);
apiDispatcher.addDispatcher("item", itemDispatcher);
apiDispatcher.addDispatcher("itemCategory", itemCategoryDispatcher);
apiDispatcher.addDispatcher("order", orderDispatcher);
apiDispatcher.addDispatcher("orderItem", orderItemDispatcher);



function init() {

}

export default {
	init,
	apiDispatcher,
};
