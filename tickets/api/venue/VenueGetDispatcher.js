import HttpDispatcher, { sendStatus } from "../../../modules/HttpDispatcher.js";
import TicketConfig from "../../TicketConfig.js";
import { getOrderDirection, getLimit } from "../functions.js";
import Venue from "../../db/Venue.js";

class VenueGetDispatcher extends HttpDispatcher {
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

			case "DATE":
				dispatchFunction = this.dispatchDate;
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
			let venue = TicketConfig.db.venue.getByID(id);
			if(!venue) {
				sendStatus(response, 404);
				return;
			}
			response.setHeader("Content-Type", "application/json");
			response.writeHead(200);
			response.end(JSON.stringify(venue));
		} catch (err) {
			sendStatus(response, 500, err.message);
		}
	}


	dispatchAll(request, response, pathElements) {
		let searchParams = this.getSearchParams(request, false);

		let orderDirection = getOrderDirection(searchParams, "DESC");;
		let order = {
			[Venue.COL_DATE]: orderDirection,
			[Venue.COL_TIME]: orderDirection,
		};
		let limit = getLimit(searchParams, null);

		try {
			let rows;
			if(searchParams.has("itemCount")) {
				rows = TicketConfig.db.venue.getAllWithItemCount(order, limit);
			}
			else {
				rows = TicketConfig.db.venue.getAll(order, limit);
			}

			response.setHeader("Content-Type", "application/json");
			response.writeHead(200);
			response.end(JSON.stringify(rows));
		} catch (err) {
			sendStatus(response, 500, err.message);
		}
	}


	dispatchName(request, response, pathElements) {
		if(!pathElements.length || !pathElements[0]) {
			sendStatus(response, 400, "No Name provided");
			return;
		}
		if(pathElements.length > 1) {
			sendStatus(response, 400, "Too many arguments");
			return;
		}
		try {
			let venue = TicketConfig.db.venue.getByName(pathElements[0]);
			if(!venue) {
				sendStatus(response, 404);
				return;
			}
			response.setHeader("Content-Type", "application/json");
			response.writeHead(200);
			response.end(JSON.stringify(venue));
		} catch (err) {
			sendStatus(response, 500, err.message);
		}
	}


	dispatchDate(request, response, pathElements) {
		if(!pathElements.length || !pathElements[0]) {
			sendStatus(response, 400, "No Name provided");
			return;
		}
		let date = pathElements.shift();

		let orderDirection = getOrderDirection(pathElements, "DESC");
		let order = {
			[Venue.COL_DATE]: orderDirection,
			[Venue.COL_TIME]: orderDirection,
		};
		let limit = getLimit(pathElements, null);

		try {
			let venues = TicketConfig.db.venue.getAllByDate(date, order, limit);
			response.setHeader("Content-Type", "application/json");
			response.writeHead(200);
			response.end(JSON.stringify(venues));
		} catch (err) {
			sendStatus(response, 500, err.message);
		}
	}
};

export default VenueGetDispatcher;
