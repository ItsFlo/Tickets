import HttpDispatcher, { sendStatus } from "../../../modules/HttpDispatcher.js";
import TicketConfig from "../../TicketConfig.js";
import Events from "../../Events.js";
import Item from "../../db/Item.js";

class ItemDeleteDispatcher extends HttpDispatcher {
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

		TicketConfig.db.item.delete(iID).then(changes => {
			response.setHeader("Content-Type", "application/json");
			response.writeHead(200);
			response.end("{}");

			if(changes) {
				Events.sendEvent(Item.TABLE, "delete", JSON.stringify({
					id: iID,
				}));
			}
		}, err => {
			sendStatus(response, 500, err.message);
		});
	}
};

export default ItemDeleteDispatcher;
