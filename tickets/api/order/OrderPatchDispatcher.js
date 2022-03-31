import HttpDispatcher, { sendStatus } from "../../../modules/HttpDispatcher.js";
import TicketConfig from "../../TicketConfig.js";
import Events from "../../Events.js";
import Order from "../../db/Order.js";

class OrderPatchDispatcher extends HttpDispatcher {
	request(sPath, request, response, oPost) {
		let iID = parseInt(oPost.id);
		if(isNaN(iID)) {
			sendStatus(response, 400, "No id provided");
			return;
		}

		let promise = null;
		switch(sPath.toUpperCase()) {
			case Order.STATUS_PREPARED:
				promise = TicketConfig.db.order.updatePrepared(iID);
				break;

			case Order.STATUS_PICKEDUP:
				promise = TicketConfig.db.order.updatePickedUp(iID);
				break;

			default:
				sendStatus(response, 400, "Invalid status");
				break;
		}
		if(!promise) {
			return;
		}

		promise.then(changes => {
			response.setHeader("Content-Type", "application/json");
			response.writeHead(200);
			response.end("{}");

			if(changes) {
				this.sendUpdateEvent(iID);
			}
		}, err => {
			sendStatus(response, 500, err.message);
		});
	}

	sendUpdateEvent(iOrderID) {
		return TicketConfig.db.order.getByID(iOrderID).then(order => {
			if(order) {
				Events.sendEvent(Order.TABLE, order[Order.COL_STATUS], order);
			}
		});
	}
};

export default OrderPatchDispatcher;
