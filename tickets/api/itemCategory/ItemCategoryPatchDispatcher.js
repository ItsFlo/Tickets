import HttpDispatcher from "../../../modules/HttpDispatcher.js";
import TicketConfig from "../../TicketConfig.js";
import ItemCategory from "../../db/ItemCategory.js";

class ItemCategoryPatchDispatcher extends HttpDispatcher {
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

		let oUpdates = {};
		let bRowsUpdated = false;
		if(oPost.hasOwnProperty("name")) {
			if(!oPost.name) {
				response.writeHead(400);
				response.end("Name must not be empty");
				return;
			}
			oUpdates[ItemCategory.COL_NAME] = oPost.name;
			bRowsUpdated = true;
		}


		if(!bRowsUpdated) {
			response.writeHead(400);
			response.end("no rows set to update");
			return;
		}

		TicketConfig.db.itemCategory.update(iID, oUpdates, (err) => {
			if(err) {
				response.writeHead(500);
				response.end(err.message);
			}
			else {
				response.setHeader("Content-Type", "application/json");
				response.writeHead(200);
				response.end("{}");
			}
		});
	}
};

export default ItemCategoryPatchDispatcher;
