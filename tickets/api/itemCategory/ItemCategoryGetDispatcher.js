import HttpDispatcher from "../../../modules/HttpDispatcher.js";
import TicketConfig from "../../TicketConfig.js";
import { getOrderDirection, getLimit } from "../functions.js";
import ItemCategory from "../../db/ItemCategory.js";

class ItemCategoryGetDispatcher extends HttpDispatcher {
	request(sPath, request, response) {
		if(!sPath) {
			response.writeHead(400);
			response.end();
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
			response.writeHead("400");
			response.end();
		}
	}





	dispatchId(request, response, aPathElements) {
		if(!aPathElements.length || isNaN(parseInt(aPathElements[0]))) {
			response.writeHead(400);
			response.end("No ID provided");
			return;
		}
		if(aPathElements.length > 1) {
			response.writeHead(400);
			response.end("Too many arguments");
			return;
		}
		let iID = parseInt(aPathElements[0]);

		TicketConfig.db.itemCategory.getByID(iID, (err, row) => {
			if(err) {
				response.writeHead(500);
				response.end(err.message);
			}
			else {
				response.setHeader("Content-Type", "application/json");
				response.writeHead(200);
				response.end(JSON.stringify(row));
			}
		});
	}


	dispatchAll(request, response, pathElements) {
		let searchParams = this.getSearchParams(request, false);

		let orderDirection = getOrderDirection(searchParams, "ASC");;
		let order = {
			[ItemCategory.COL_NAME]: orderDirection,
		};
		let limit = getLimit(searchParams, null);

		let callback = (err, rows) => {
			if(err) {
				response.writeHead(500);
				response.end(err.message);
			}
			else {
				response.setHeader("Content-Type", "application/json");
				response.writeHead(200);
				response.end(JSON.stringify(rows));
			}
		};

		let venueID = parseInt(searchParams.get("venue", null));
		if(isNaN(venueID)) {
			TicketConfig.db.itemCategory.getAll(callback, order, limit);
		}
		else {
			TicketConfig.db.itemCategory.getAllByVenue(venueID, callback, order, limit);
		}
	}


	dispatchName(request, response, aPathElements) {
		if(aPathElements.length < 3) {
			response.writeHead(400);
			response.end("Too few arguments");
			return;
		}
		let sName = aPathElements[0];
		if(!sName) {
			response.writeHead(400);
			response.end("No Name provided");
			return;
		}
		let iVenueID = parseInt(aPathElements[2]);
		if(isNaN(iVenueID) || aPathElements[1].toUpperCase() !== "VENUE") {
			response.writeHead(400);
			response.end("No Venue provided");
			return;
		}

		TicketConfig.db.itemCategory.getByName(iVenueID, sName, (err, row) => {
			if(err) {
				response.writeHead(500);
				response.end(err.message);
			}
			else {
				response.setHeader("Content-Type", "application/json");
				response.writeHead(200);
				response.end(JSON.stringify(row));
			}
		});
	}
};

export default ItemCategoryGetDispatcher;
