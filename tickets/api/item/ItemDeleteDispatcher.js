import HttpDispatcher, { sendStatus } from "../../../modules/HttpDispatcher.js";
import TicketConfig from "../../TicketConfig.js";
import Events from "../../Events.js";
import Item from "../../db/Item.js";

class ItemDeleteDispatcher extends HttpDispatcher {
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

		try {
			let changes = TicketConfig.db.item.delete(id);
			response.setHeader("Content-Type", "application/json");
			response.writeHead(200);
			response.end("{}");

			if(changes) {
				Events.sendEvent(Item.TABLE, "delete", {
					id: id,
				});
			}
		} catch (err) {
			sendStatus(response, 500, err.message);
		}
	}
};

export default ItemDeleteDispatcher;
