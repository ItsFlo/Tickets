import HttpDispatcher from "../../../modules/HttpDispatcher.js";
import TicketConfig from "../../TicketConfig.js";
import ItemCategory from "../../db/ItemCategory.js";
import Events from "../../Events.js";

class ItemCategoryDeleteDispatcher extends HttpDispatcher {
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

		TicketConfig.db.itemCategory.delete(iID, (err, changes) => {
			if(err) {
				response.writeHead(500);
				response.end(err.message);
			}
			else {
				response.setHeader("Content-Type", "application/json");
				response.writeHead(200);
				response.end("{}");

				if(changes) {
					Events.sendEvent(ItemCategory.TABLE, "delete", JSON.stringify({
						id: iID,
					}));
				}
			}
		});
	}
};

export default ItemCategoryDeleteDispatcher;
