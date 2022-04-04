import HttpDispatcher, { sendStatus } from "../../../modules/HttpDispatcher.js";
import TicketConfig from "../../TicketConfig.js";
import { getOrderDirection, getLimit } from "../functions.js";
import Item from "../../db/Item.js";
import OrderItem from "../../db/OrderItem.js";

class OrderItemGetDispatcher extends HttpDispatcher {
	request(path, request, response) {
		if(!path) {
			sendStatus(response, 400);
			return;
		}
		let pathElements = this.splitPath(path);
		let dispatchFunction = null;

		switch(pathElements[0].toUpperCase()) {
			case "ID":
				dispatchFunction = this.dispatchId;
				break;

			case "ALL":
				dispatchFunction = this.dispatchAll;
				break;
		}

		if(dispatchFunction) {
			pathElements.shift();
			dispatchFunction.call(this, request, response, pathElements);
		}
		else {
			sendStatus(response, 400);
		}
	}





	dispatchId(request, response, pathElements) {
		if(pathElements.length > 1) {
			sendStatus(response, 400, "Too many arguments");
			return;
		}
		if(!pathElements.length || isNaN(parseInt(pathElements[0]))) {
			sendStatus(response, 400, "No ID provided");
			return;
		}
		let id = parseInt(pathElements[0]);
		try {
			let orderItem = TicketConfig.db.orderItem.getByID(id);
			if(!orderItem) {
				sendStatus(response, 404);
				return;
			}
			response.setHeader("Content-Type", "application/json");
			response.writeHead(200);
			response.end(JSON.stringify(orderItem));
		} catch (err) {
			sendStatus(response, 500, err.message);
		}
	}


	dispatchAll(request, response, pathElements) {
		let searchParams = this.getSearchParams(request, false);

		let orderDirection = getOrderDirection(searchParams, "ASC");
		let sortOrder = {
			[Item.COL_NAME]: orderDirection,
		};
		let limit = getLimit(searchParams, null);
		let orderId = parseInt(searchParams.get("order", null));
		let venueId = parseInt(searchParams.get("venue", null));

		try {
			let orderItems;
			if(!isNaN(orderId)) {
				orderItems = TicketConfig.db.item.getAllForOrder(orderId, sortOrder, limit);
			}
			else if(!isNaN(venueId)) {
				let status = searchParams.getAll("status").map(tmp => tmp.toUpperCase());
				orderItems = TicketConfig.db.item.getAllForVenue(venueId, sortOrder, limit, status);
				for(let orderItem of orderItems) {
					if(orderItem[OrderItem.COL_COUNT] === null) {
						orderItem[OrderItem.COL_COUNT] = 0;
					}
				}
			}
			else {
				orderItems = TicketConfig.db.orderItem.getAll(null, limit);
			}

			response.setHeader("Content-Type", "application/json");
			response.writeHead(200);
			response.end(JSON.stringify(orderItems));
		} catch (err) {
			sendStatus(response, 500, err.message);
		}
	}
};

export default OrderItemGetDispatcher;
