import HttpDispatcher, { sendStatus } from "../../../modules/HttpDispatcher.js";
import TicketConfig from "../../TicketConfig.js";
import Events from "../../Events.js";
import ItemCategory from "../../db/ItemCategory.js";

class ItemCategoryPutDispatcher extends HttpDispatcher {
	request(sPath, request, response, oPost) {
		if(sPath) {
			sendStatus(response, 404);
			return;
		}
		let iVenueID = parseInt(oPost.venue);
		if(isNaN(iVenueID)) {
			sendStatus(response, 400, "No venue provided");
			return;
		}
		if(!oPost.hasOwnProperty("name") || !oPost.name) {
			sendStatus(response, 400, "No name provided");
			return;
		}

		TicketConfig.db.itemCategory.create(iVenueID, oPost.name).then(lastID => {
			response.setHeader("Content-Type", "application/json");
			response.writeHead(201);
			response.end(JSON.stringify({
				id: lastID,
			}));

			Events.sendEvent(ItemCategory.TABLE, "create", JSON.stringify({
				id: lastID,
				venue: iVenueID,
				name: oPost.name,
			}));
		}, err => {
			sendStatus(response, 500, err.message);
		});
	}
};

export default ItemCategoryPutDispatcher;
