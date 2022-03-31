import HttpDispatcher, { sendStatus } from "../../../modules/HttpDispatcher.js";
import TicketConfig from "../../TicketConfig.js";
import OrderGetter from "./OrderGetter.js";

class OrderGetDispatcher extends HttpDispatcher {
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
			let order = TicketConfig.db.order.getByID(id);
			if(!order) {
				sendStatus(response, 404);
				return;
			}
			response.setHeader("Content-Type", "application/json");
			response.writeHead(200);
			response.end(JSON.stringify(order));
		} catch (err) {
			sendStatus(response, 500, err.message);
		}
	}


	dispatchAll(request, response, pathElements) {
		let searchParams = this.getSearchParams(request, false);

		let venueID = searchParams.get("venue", null);
		let status = [];
		for(let searchParamStatus of searchParams.getAll("status")) {
			status.push(searchParamStatus.toUpperCase());
		}

		try {
			let orders = OrderGetter.getAll(venueID, status);
			response.setHeader("Content-Type", "application/json");
			response.writeHead(200);
			response.end(JSON.stringify(orders));
		} catch (err) {
			sendStatus(response, 500, err.message);
		}
	}
};

export default OrderGetDispatcher;
