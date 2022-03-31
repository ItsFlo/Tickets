import HttpDispatcher, { sendStatus } from "../../../modules/HttpDispatcher.js";
import TicketConfig from "../../TicketConfig.js";
import { getOrderDirection, getLimit } from "../functions.js";
import Venue from "../../db/Venue.js";

class VenueGetDispatcher extends HttpDispatcher {
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

			case "DATE":
				dispatchFunction = this.dispatchDate;
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
		TicketConfig.db.venue.getByID(iID).then(row => {
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

		let orderDirection = getOrderDirection(searchParams, "DESC");;
		let order = {
			[Venue.COL_DATE]: orderDirection,
			[Venue.COL_TIME]: orderDirection,
		};
		let limit = getLimit(searchParams, null);

		let promise;
		if(searchParams.has("itemCount")) {
			promise = TicketConfig.db.venue.getAllWithItemCount(order, limit);
		}
		else {
			promise = TicketConfig.db.venue.getAll(order, limit);
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
		if(!aPathElements.length || !aPathElements[0]) {
			sendStatus(response, 400, "No Name provided");
			return;
		}
		if(aPathElements.length > 1) {
			sendStatus(response, 400, "Too many arguments");
			return;
		}
		TicketConfig.db.venue.getByName(aPathElements[0]).then(row => {
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


	dispatchDate(request, response, aPathElements) {
		if(!aPathElements.length || !aPathElements[0]) {
			sendStatus(response, 400, "No Name provided");
			return;
		}
		let sDate = aPathElements.shift();

		let sOrderDirection = getOrderDirection(aPathElements, "DESC");
		let oOrder = {
			[Venue.COL_DATE]: sOrderDirection,
			[Venue.COL_TIME]: sOrderDirection,
		};
		let iLimit = getLimit(aPathElements, null);
		TicketConfig.db.venue.getAllByDate(sDate, oOrder, iLimit).then(rows => {
			response.setHeader("Content-Type", "application/json");
			response.writeHead(200);
			response.end(JSON.stringify(rows));
		}, err => {
			sendStatus(response, 500, err.message);
		});
	}
};

export default VenueGetDispatcher;
