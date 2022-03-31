import HttpDispatcher, { sendStatus } from "../../../modules/HttpDispatcher.js";
import TicketConfig from "../../TicketConfig.js";
import Events from "../../Events.js";
import Item from "../../db/Item.js";

class ItemPutDispatcher extends HttpDispatcher {
	request(path, request, response, post) {
		if(path) {
			sendStatus(response, 404);
			return;
		}
		let itemCategoryID = parseInt(post.itemCategory);
		if(isNaN(itemCategoryID)) {
			sendStatus(response, 400, "No item-category provided");
			return;
		}
		if(!post.hasOwnProperty("name") || !post.name) {
			sendStatus(response, 400, "No name provided");
			return;
		}
		let price = parseFloat(post.price);
		if(isNaN(price)) {
			sendStatus(response, 400, "No price provided");
			return;
		}

		try {
			let lastID = TicketConfig.db.item.create(itemCategoryID, post.name, price);
			response.setHeader("Content-Type", "application/json");
			response.writeHead(201);
			response.end(JSON.stringify({
				id: lastID,
			}));

			Events.sendEvent(Item.TABLE, "create", {
				id: lastID,
				itemCategory: itemCategoryID,
				name: post.name,
				price: price,
			});
		} catch (err) {
			sendStatus(response, 500, err.message);
		}
	}
};

export default ItemPutDispatcher;
