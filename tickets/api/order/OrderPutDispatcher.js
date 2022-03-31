import HttpDispatcher, { sendStatus } from "../../../modules/HttpDispatcher.js";
import TicketConfig from "../../TicketConfig.js";
import Events from "../../Events.js";
import Order from "../../db/Order.js";
import OrderGetter from "./OrderGetter.js";

function insertTransactionFunction(venueID, items) {
	let orderId = TicketConfig.db.order.create(venueID, null, Order.STATUS_OPEN);

	for(let item of items) {
		let itemId = TicketConfig.db.orderItem.create(orderId, item.id, item.count, Order.STATUS_OPEN);
	}

	let changes = TicketConfig.db.order.recalculatePrice(orderId);
	return orderId;
}


class OrderPutDispatcher extends HttpDispatcher {
	request(path, request, response, post) {
		if(path) {
			sendStatus(response, 404);
			return;
		}
		let venueID = parseInt(post.venue);
		if(isNaN(venueID)) {
			sendStatus(response, 400, "No venue provided");
			return;
		}
		let items = [];
		if(Array.isArray(post.items)) {
			for(let item of post.items) {
				item.id = parseInt(item.id);
				if(isNaN(item.id)) {
					continue;
				}
				item.count = parseInt(item.count);
				if(isNaN(item.count) || item.count < 1) {
					continue;
				}
				items.push(item);
			}
		}
		if(!items.length) {
			sendStatus(response, 400, "No items provided");
			return;
		}

		try {
			let transaction = TicketConfig.db.transaction(insertTransactionFunction);
			let orderId = transaction.immediate(venueID, items);
			let order = OrderGetter.getOrder(orderId);
			if(!order) {
				sendStatus(response, 500, "Couldn´t fetch new order");
				return;
			}
			response.writeHead(201);
			response.end(JSON.stringify(order));

			Events.sendEvent(Order.TABLE, "create", order);
		} catch (err) {
			sendStatus(response, 500, err.message);
		}
	}
};

export default OrderPutDispatcher;
