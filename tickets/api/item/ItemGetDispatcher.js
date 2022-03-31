import HttpDispatcher, { sendStatus } from "../../../modules/HttpDispatcher.js";
import TicketConfig from "../../TicketConfig.js";
import { getOrderDirection, getLimit } from "../functions.js";
import Item from "../../db/Item.js";

class ItemGetDispatcher extends HttpDispatcher {
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
			let item = TicketConfig.db.item.getByID(id);
			if(!item) {
				sendStatus(response, 404);
				return;
			}
			response.setHeader("Content-Type", "application/json");
			response.writeHead(200);
			response.end(JSON.stringify(item));
		} catch (err) {
			sendStatus(response, 500, err.message);
		}
	}


	dispatchAll(request, response, pathElements) {
		let searchParams = this.getSearchParams(request, false);

		let orderDirection = getOrderDirection(searchParams, "ASC");;
		let order = {
			[Item.COL_NAME]: orderDirection,
		};
		let limit = getLimit(searchParams, null);
		let itemCategoryID = parseInt(searchParams.get("itemCategory", null));

		try {
			let items;
			if(isNaN(itemCategoryID)) {
				items = TicketConfig.db.item.getAll(order, limit);
			}
			else {
				items = TicketConfig.db.item.getAllByItemCategory(itemCategoryID, order, limit);
			}

			response.setHeader("Content-Type", "application/json");
			response.writeHead(200);
			response.end(JSON.stringify(items));
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
		let itemCategoryID = parseInt(pathElements[2]);
		if(isNaN(itemCategoryID) || pathElements[1].toUpperCase() !== "ITEMCATEGORY") {
			sendStatus(response, 400, "No Venue provided");
			return;
		}

		try {
			let item = TicketConfig.db.item.getByName(itemCategoryID, name);
			if(!item) {
				sendStatus(response, 404);
				return;
			}
			response.setHeader("Content-Type", "application/json");
			response.writeHead(200);
			response.end(JSON.stringify(item));
		} catch (err) {
			sendStatus(response, 500, err.message);
		}
	}
};

export default ItemGetDispatcher;
