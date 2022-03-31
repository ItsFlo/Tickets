import HttpDispatcher, { sendStatus } from "../../../modules/HttpDispatcher.js";
import TicketConfig from "../../TicketConfig.js";
import Events from "../../Events.js";
import ItemCategory from "../../db/ItemCategory.js";

class ItemCategoryPutDispatcher extends HttpDispatcher {
	request(path, request, response, post) {
		if(path) {
			sendStatus(response, 404);
			return;
		}
		let venueId = parseInt(post.venue);
		if(isNaN(venueId)) {
			sendStatus(response, 400, "No venue provided");
			return;
		}
		if(!post.hasOwnProperty("name") || !post.name) {
			sendStatus(response, 400, "No name provided");
			return;
		}

		try {
			let lastID = TicketConfig.db.itemCategory.create(venueId, post.name);
			response.setHeader("Content-Type", "application/json");
			response.writeHead(201);
			response.end(JSON.stringify({
				id: lastID,
			}));

			Events.sendEvent(ItemCategory.TABLE, "create", {
				id: lastID,
				venue: venueId,
				name: post.name,
			});
		} catch (err) {
			sendStatus(response, 500, err.message);
		}
	}
};

export default ItemCategoryPutDispatcher;
