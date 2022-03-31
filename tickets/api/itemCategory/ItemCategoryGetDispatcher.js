import HttpDispatcher, { sendStatus } from "../../../modules/HttpDispatcher.js";
import TicketConfig from "../../TicketConfig.js";
import { getOrderDirection, getLimit } from "../functions.js";
import ItemCategory from "../../db/ItemCategory.js";

class ItemCategoryGetDispatcher extends HttpDispatcher {
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

			case "NAME":
				dispatchFunction = this.dispatchName;
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
		if(!pathElements.length || isNaN(parseInt(pathElements[0]))) {
			sendStatus(response, 400, "No ID provided");
			return;
		}
		if(pathElements.length > 1) {
			sendStatus(response, 400, "Too many arguments");
			return;
		}
		let id = parseInt(pathElements[0]);

		try {
			let itemCategory = TicketConfig.db.itemCategory.getByID(id);
			if(!itemCategory) {
				sendStatus(response, 404);
				return;
			}
			response.setHeader("Content-Type", "application/json");
			response.writeHead(200);
			response.end(JSON.stringify(itemCategory));
		} catch (err) {
			sendStatus(response, 500, err.message);
		}
	}


	dispatchAll(request, response, pathElements) {
		let searchParams = this.getSearchParams(request, false);

		let orderDirection = getOrderDirection(searchParams, "ASC");;
		let order = {
			[ItemCategory.COL_NAME]: orderDirection,
		};
		let limit = getLimit(searchParams, null);
		let venueId = parseInt(searchParams.get("venue", null));

		try {
			let itemCategories;
			if(isNaN(venueId)) {
				itemCategories = TicketConfig.db.itemCategory.getAll(order, limit);
			}
			else {
				itemCategories = TicketConfig.db.itemCategory.getAllByVenue(venueId, order, limit);
			}
			response.setHeader("Content-Type", "application/json");
			response.writeHead(200);
			response.end(JSON.stringify(itemCategories));
		} catch (err) {
			sendStatus(response, 500, err.message);
		}
	}


	dispatchName(request, response, pathElements) {
		if(pathElements.length < 3) {
			sendStatus(response, 400, "Too few arguments");
			return;
		}
		let name = pathElements[0];
		if(!name) {
			sendStatus(response, 400, "No Name provided");
			return;
		}
		let venueId = parseInt(pathElements[2]);
		if(isNaN(venueId) || pathElements[1].toUpperCase() !== "VENUE") {
			sendStatus(response, 400, "No Venue provided");
			return;
		}

		try {
			let itemCategory = TicketConfig.db.itemCategory.getByName(venueId, name);
			if(!itemCategory) {
				sendStatus(response, 400);
				return;
			}
			response.setHeader("Content-Type", "application/json");
			response.writeHead(200);
			response.end(JSON.stringify(itemCategory));
		} catch (err) {
			sendStatus(response, 500, err.message);
		}
	}
};

export default ItemCategoryGetDispatcher;
