import HttpDispatcher, { sendStatus } from "../../../modules/HttpDispatcher.js";
import TicketConfig from "../../TicketConfig.js";
import Events from "../../Events.js";
import ItemCategory from "../../db/ItemCategory.js";

class ItemCategoryPatchDispatcher extends HttpDispatcher {
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

		let updates = {};
		let rowsAreUpdated = false;
		if(post.hasOwnProperty("name")) {
			if(!post.name) {
				sendStatus(response, 400, "Name must not be empty");
				return;
			}
			updates[ItemCategory.COL_NAME] = post.name;
			rowsAreUpdated = true;
		}


		if(!rowsAreUpdated) {
			sendStatus(response, 400, "no rows set to update");
			return;
		}

		try {
			let changes = TicketConfig.db.itemCategory.update(id, updates);
			response.setHeader("Content-Type", "application/json");
			response.writeHead(200);
			response.end("{}");

			if(changes) {
				updates.id = id;
				Events.sendEvent(ItemCategory.TABLE, "update", JSON.stringify(updates));
			}
		} catch (err) {
			sendStatus(response, 500, err.message);
		}
	}
};

export default ItemCategoryPatchDispatcher;
