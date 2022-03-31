import HttpDispatcher, { sendStatus } from "../../../modules/HttpDispatcher.js";
import TicketConfig from "../../TicketConfig.js";
import Events from "../../Events.js";
import Order from "../../db/Order.js"

class OrderDeleteDispatcher extends HttpDispatcher {
	request(sPath, request, response, oPost) {
		if(sPath) {
			sendStatus(response, 404);
			return;
		}
		let iID = parseInt(oPost.id);
		if(isNaN(iID)) {
			sendStatus(response, 400, "No id provided");
			return;
		}

		let errCallback = (err) => {
			sendStatus(response, 500, err.message);
		};
		TicketConfig.db.order.getByID(iID).then(row => {
			if(!row) {
				response.setHeader("Content-Type", "application/json");
				response.writeHead(200);
				response.end("{}");
				return;
			}
			let iVenueID = row[Order.COL_VENUE];
			TicketConfig.db.order.delete(iID).then(changes => {
				response.setHeader("Content-Type", "application/json");
				response.writeHead(200);
				response.end("{}");

				if(changes) {
					Events.sendEvent(Order.TABLE, "delete", {
						[Order.COL_ID]: iID,
						[Order.COL_VENUE]: iVenueID,
					});
				}
			}, errCallback);
		}, errCallback);
	}
};

export default OrderDeleteDispatcher;
