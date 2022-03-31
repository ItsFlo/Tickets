import HttpDispatcher, { sendStatus } from "../../../modules/HttpDispatcher.js";
import TicketConfig from "../../TicketConfig.js";
import Events from "../../Events.js";
import Order from "../../db/Order.js"

class OrderDeleteDispatcher extends HttpDispatcher {
	request(path, request, response, post) {
		if(path) {
			sendStatus(response, 404);
			return;
		}
		let id = parseInt(post.id);
		if(isNaN(id)) {
			sendStatus(response, 400, "No id provided");
			return;
		}

		try {
			let order = TicketConfig.db.order.getByID(id);
			if(!order) {
				response.setHeader("Content-Type", "application/json");
				response.writeHead(200);
				response.end("{}");
				return;
			}
			let venueID = order[Order.COL_VENUE];

			let changes = TicketConfig.db.order.delete(id);
			response.setHeader("Content-Type", "application/json");
			response.writeHead(200);
			response.end("{}");

			if(changes) {
				Events.sendEvent(Order.TABLE, "delete", {
					[Order.COL_ID]: id,
					[Order.COL_VENUE]: venueID,
				});
			}
		} catch (err) {
			sendStatus(response, 500, err.message);
		}
	}
};

export default OrderDeleteDispatcher;
