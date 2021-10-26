import HttpDispatcher from "../../../modules/HttpDispatcher.js";
import TicketConfig from "../../TicketConfig.js";
import Order from "../../db/Order.js"
import Events from "../../Events.js";

class OrderDeleteDispatcher extends HttpDispatcher {
	request(sPath, request, response, oPost) {
		if(sPath) {
			response.writeHead(404);
			response.end();
			return;
		}
		let iID = parseInt(oPost.id);
		if(isNaN(iID)) {
			response.writeHead(400);
			response.end("No id provided");
			return;
		}

		TicketConfig.db.order.getByID((err, row) => {
			if(err) {
				response.writeHead(500);
				response.end(err.message);
				return;
			}

			let iVenueID = row[Order.COL_VENUE];
			TicketConfig.db.order.delete(iID, (err, changes) => {
				if(err) {
					response.writeHead(500);
					response.end(err.message);
				}
				else {
					response.setHeader("Content-Type", "application/json");
					response.writeHead(200);
					response.end("{}");
	
					if(changes) {
						Events.sendEvent(Order.TABLE, "delete", {
							[Order.COL_ID]: iID,
							[Order.COL_VENUE]: iVenueID,
						});
					}
				}
			});
		});
	}
};

export default OrderDeleteDispatcher;
