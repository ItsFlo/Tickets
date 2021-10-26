import HttpDispatcher from "../../../modules/HttpDispatcher.js";
import TicketConfig from "../../TicketConfig.js";
import Order from "../../db/Order.js";
import Events from "../../Events.js";

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
			case "DONE":
				TicketConfig.db.order.updateDone(iID, callback);
				break;

			case "PICKUP":
				TicketConfig.db.order.updatePickup(iID, callback);
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
