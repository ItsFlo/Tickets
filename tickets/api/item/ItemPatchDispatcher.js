import HttpDispatcher, { sendStatus } from "../../../modules/HttpDispatcher.js";
import TicketConfig from "../../TicketConfig.js";
import Events from "../../Events.js";
import Item from "../../db/Item.js";

class ItemPatchDispatcher extends HttpDispatcher {
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

		let oUpdates = {};
		let bRowsUpdated = false;
		if(oPost.hasOwnProperty("name")) {
			if(!oPost.name) {
				sendStatus(response, 400, "Name must not be empty");
				return;
			}
			oUpdates[Item.COL_NAME] = oPost.name;
			bRowsUpdated = true;
		}
		if(oPost.hasOwnProperty("price")) {
			let fPrice = parseFloat(oPost.price);
			if(isNaN(fPrice)) {
				sendStatus(response, 400, "No price provided");
				return;
			}
			oUpdates[Item.COL_PRICE] = fPrice;
			bRowsUpdated = true;
		}


		if(!bRowsUpdated) {
			sendStatus(response, 400, "no rows set to update");
			return;
		}

		TicketConfig.db.item.update(iID, oUpdates).then(changes => {
			response.setHeader("Content-Type", "application/json");
			response.writeHead(200);
			response.end("{}");
	
			if(changes) {
				oUpdates.id = iID;
				Events.sendEvent(Item.TABLE, "update", JSON.stringify(oUpdates));
			}
		}, err => {
			sendStatus(response, 500, err.message);
		});
	}
};

export default ItemPatchDispatcher;
