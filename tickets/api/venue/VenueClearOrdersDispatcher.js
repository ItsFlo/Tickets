import HttpDispatcher, { sendStatus } from "../../../modules/HttpDispatcher.js";
import TicketConfig from "../../TicketConfig.js";
import Events from "../../Events.js";
import Order from "../../db/Order.js";

class VenueClearOrdersDispatcher extends HttpDispatcher {
	request(path, request, response) {
		let id = parseInt(path);
		if(isNaN(id)) {
			sendStatus(response, 400, "No id provided");
			return;
		}

		try {
			let changes = TicketConfig.db.order.deleteAllFromVenue(id);
			response.setHeader("Content-Type", "application/json");
			response.writeHead(200);
			response.end("{}");

			if(changes) {
				Events.sendEvent(Order.TABLE, "clearOrders", {
					[Order.COL_VENUE]: id,
				});
			}
		} catch (err) {
			sendStatus(response, 500, err.message);
		}
	}
};

export default VenueClearOrdersDispatcher;
