import HttpDispatcher from "../../../modules/HttpDispatcher.js";
import TicketConfig from "../../TicketConfig.js";
import Item from "../../db/Item.js";

class ItemPatchDispatcher extends HttpDispatcher {
	dispatch(sPath, request, response, oPost) {
		if(sPath) {
			response.writeHead(404);
			response.end();
			return;
		}
		if(!oPost.hasOwnProperty("id") || isNaN(parseInt(oPost.id))) {
			response.writeHead(400);
			response.end("No id provided");
			return;
		}
		let iID = parseInt(oPost.id);

		let oUpdates = {};
		let bRowsUpdated = false;
		if(oPost.hasOwnProperty("name")) {
			if(!oPost.name) {
				response.writeHead(400);
				response.end("Name must not be empty");
				return;
			}
			oUpdates[Item.COL_NAME] = oPost.name;
			bRowsUpdated = true;
		}
		if(oPost.hasOwnProperty("price")) {
			let fPrice = parseFloat(oPost.price);
			if(isNaN(fPrice)) {
				response.writeHead(400);
				response.end("No price provided");
				return;
			}
			oUpdates[Item.COL_PRICE] = fPrice;
			bRowsUpdated = true;
		}


		if(!bRowsUpdated) {
			response.writeHead(400);
			response.end("no rows set to update");
			return;
		}

		TicketConfig.db.item.update(iID, oUpdates, (err) => {
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

export default ItemPatchDispatcher;
