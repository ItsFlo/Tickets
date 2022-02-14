import HttpDispatcher from "../../../modules/HttpDispatcher.js";
import TicketConfig from "../../TicketConfig.js";
import Events from "../../Events.js";
import Order from "../../db/Order.js";

class OrderPatchDispatcher extends HttpDispatcher {
	request(sPath, request, response, oPost) {
		let iID = parseInt(oPost.id);
		if(isNaN(iID)) {
			response.writeHead(400);
			response.end("No id provided");
			return;
		}

		let callback = (err, changes) => {
			if(err) {
				response.writeHead(500);
				response.end(err.message);
			}
			else {
				response.setHeader("Content-Type", "application/json");
				response.writeHead(200);
				response.end("{}");

				if(changes) {
					this.sendUpdateEvent(iID);
				}
			}
		};

		switch(sPath.toUpperCase()) {
			case Order.STATUS_PREPARED:
				TicketConfig.db.order.updatePrepared(iID, callback);
				break;

			case Order.STATUS_PICKEDUP:
				TicketConfig.db.order.updatePickedUp(iID, callback);
				break;

			default:
				response.writeHead(400);
				response.end("Invalid status");
				break;
		}
	}

	sendUpdateEvent(iOrderID) {
		TicketConfig.db.order.getByID(iOrderID, (err, oOrder) => {
			if(!err) {
				Events.sendEvent(Order.TABLE, oOrder[Order.COL_STATUS], oOrder);
			}
		});
	}
};

export default OrderPatchDispatcher;
