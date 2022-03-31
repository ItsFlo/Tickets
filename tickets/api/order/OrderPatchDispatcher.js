import HttpDispatcher, { sendStatus } from "../../../modules/HttpDispatcher.js";
import TicketConfig from "../../TicketConfig.js";
import Events from "../../Events.js";
import Order from "../../db/Order.js";

function sendUpdateEvent(orderID) {
	try {
		let order = TicketConfig.db.order.getByID(orderID);
		if(order) {
			Events.sendEvent(Order.TABLE, order[Order.COL_STATUS], order);
		}
	} catch (err) {}
}

class OrderPatchDispatcher extends HttpDispatcher {
	request(path, request, response, post) {
		let id = parseInt(post.id);
		if(isNaN(id)) {
			sendStatus(response, 400, "No id provided");
			return;
		}

		try {
			let changes = 0;
			switch(path.toUpperCase()) {
				case Order.STATUS_PREPARED:
					changes = TicketConfig.db.order.updatePrepared(id);
					break;

				case Order.STATUS_PICKEDUP:
					changes = TicketConfig.db.order.updatePickedUp(id);
					break;

				case Order.STATUS_CANCELED:
					changes = TicketConfig.db.order.cancel(id);
					break;

				default:
					sendStatus(response, 400, "Invalid status");
					return;
			}
			response.setHeader("Content-Type", "application/json");
			response.writeHead(200);
			response.end("{}");

			if(changes) {
				sendUpdateEvent(id);
			}
		} catch (err) {
			sendStatus(response, 500, err.message);
		}
	}
};

export default OrderPatchDispatcher;
