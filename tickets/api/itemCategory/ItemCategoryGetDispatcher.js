import HttpDispatcher, { sendStatus } from "../../../modules/HttpDispatcher.js";
import TicketConfig from "../../TicketConfig.js";
import { getOrderDirection, getLimit } from "../functions.js";
import ItemCategory from "../../db/ItemCategory.js";

class ItemCategoryGetDispatcher extends HttpDispatcher {
	request(sPath, request, response) {
		if(!sPath) {
			sendStatus(response, 400);
			return;
		}
		let aPathElements = this.splitPath(sPath);
		let dispatchFunction = null;

		switch(aPathElements[0].toUpperCase()) {
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
			aPathElements.shift();
			dispatchFunction.call(this, request, response, aPathElements);
		}
		else {
			sendStatus(response, 400);
		}
	}





	dispatchId(request, response, aPathElements) {
		if(!aPathElements.length || isNaN(parseInt(aPathElements[0]))) {
			sendStatus(response, 400, "No ID provided");
			return;
		}
		if(aPathElements.length > 1) {
			sendStatus(response, 400, "Too many arguments");
			return;
		}
		let iID = parseInt(aPathElements[0]);

		TicketConfig.db.itemCategory.getByID(iID).then(row => {
			if(!row) {
				sendStatus(response, 404);
				return;
			}
			response.setHeader("Content-Type", "application/json");
			response.writeHead(200);
			response.end(JSON.stringify(row));
		}, err => {
			sendStatus(response, 500, err.message);
		});
	}


	dispatchAll(request, response, pathElements) {
		let searchParams = this.getSearchParams(request, false);

		let orderDirection = getOrderDirection(searchParams, "ASC");;
		let order = {
			[ItemCategory.COL_NAME]: orderDirection,
		};
		let limit = getLimit(searchParams, null);
		let venueID = parseInt(searchParams.get("venue", null));

		let promise;
		if(isNaN(venueID)) {
			promise = TicketConfig.db.itemCategory.getAll(order, limit);
		}
		else {
			promise = TicketConfig.db.itemCategory.getAllByVenue(venueID, order, limit);
		}

		promise.then(rows => {
			response.setHeader("Content-Type", "application/json");
			response.writeHead(200);
			response.end(JSON.stringify(rows));
		}, err => {
			sendStatus(response, 500, err.message);
		});
	}


	dispatchName(request, response, aPathElements) {
		if(aPathElements.length < 3) {
			sendStatus(response, 400, "Too few arguments");
			return;
		}
		let sName = aPathElements[0];
		if(!sName) {
			sendStatus(response, 400, "No Name provided");
			return;
		}
		let iVenueID = parseInt(aPathElements[2]);
		if(isNaN(iVenueID) || aPathElements[1].toUpperCase() !== "VENUE") {
			sendStatus(response, 400, "No Venue provided");
			return;
		}

		TicketConfig.db.itemCategory.getByName(iVenueID, sName).then(row => {
			if(!row) {
				sendStatus(response, 400);
				return;
			}
			response.setHeader("Content-Type", "application/json");
			response.writeHead(200);
			response.end(JSON.stringify(row));
		}, err => {
			sendStatus(response, 500, err.message);
		});
	}
};

export default ItemCategoryGetDispatcher;
