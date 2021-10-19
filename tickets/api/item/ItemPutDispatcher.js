import HttpDispatcher from "../../../modules/HttpDispatcher.js";
import TicketConfig from "../../TicketConfig.js";
import Events from "../../Events.js";
import Item from "../../db/Item.js";

class ItemPutDispatcher extends HttpDispatcher {
	request(sPath, request, response, oPost) {
		if(sPath) {
			response.writeHead(404);
			response.end();
			return;
		}
		let iItemCategoryID = parseInt(oPost.itemCategory);
		if(isNaN(iItemCategoryID)) {
			response.writeHead(400);
			response.end("No item-category provided");
			return;
		}
		if(!oPost.hasOwnProperty("name") || !oPost.name) {
			response.writeHead(400);
			response.end("No name provided");
			return;
		}
		let fPrice = parseFloat(oPost.price);
		if(isNaN(fPrice)) {
			response.writeHead(400);
			response.end("No price provided");
			return;
		}

		TicketConfig.db.item.create(iItemCategoryID, oPost.name, fPrice, (err, lastID) => {
			if(err) {
				response.writeHead(500);
				response.end(err.message);
			}
			else {
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
			}
		});
	}
};

export default ItemPutDispatcher;
