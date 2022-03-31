import HttpDispatcher, { sendStatus } from "../../../modules/HttpDispatcher.js";
import TicketConfig from "../../TicketConfig.js";
import Events from "../../Events.js";
import Item from "../../db/Item.js";

class ItemPutDispatcher extends HttpDispatcher {
	request(sPath, request, response, oPost) {
		if(sPath) {
			sendStatus(response, 404);
			return;
		}
		let iItemCategoryID = parseInt(oPost.itemCategory);
		if(isNaN(iItemCategoryID)) {
			sendStatus(response, 400, "No item-category provided");
			return;
		}
		if(!oPost.hasOwnProperty("name") || !oPost.name) {
			sendStatus(response, 400, "No name provided");
			return;
		}
		let fPrice = parseFloat(oPost.price);
		if(isNaN(fPrice)) {
			sendStatus(response, 400, "No price provided");
			return;
		}

		TicketConfig.db.item.create(iItemCategoryID, oPost.name, fPrice).then(lastID => {
			response.setHeader("Content-Type", "application/json");
			response.writeHead(201);
			response.end(JSON.stringify({
				id: lastID,
			}));

			Events.sendEvent(Item.TABLE, "create", JSON.stringify({
				id: lastID,
				itemCategory: iItemCategoryID,
				name: oPost.name,
				price: fPrice,
			}));
		}, err => {
			sendStatus(response, 500, err.message);
		});
	}
};

export default ItemPutDispatcher;
