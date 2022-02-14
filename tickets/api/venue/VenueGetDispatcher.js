import HttpDispatcher from "../../../modules/HttpDispatcher.js";
import TicketConfig from "../../TicketConfig.js";
import { getOrderDirection, getLimit } from "../functions.js";
import Venue from "../../db/Venue.js";

class VenueGetDispatcher extends HttpDispatcher {
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

			case "DATE":
				dispatchFunction = this.dispatchDate;
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
		TicketConfig.db.venue.getByID(iID, (err, row) => {
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

		let orderDirection = getOrderDirection(searchParams, "DESC");;
		let order = {
			[Venue.COL_DATE]: orderDirection,
			[Venue.COL_TIME]: orderDirection,
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

		if(searchParams.has("itemCount")) {
			TicketConfig.db.venue.getAllWithItemCount(callback, order, limit);
		}
		else {
			TicketConfig.db.venue.getAll(callback, order, limit);
		}
	}


	dispatchName(request, response, aPathElements) {
		if(!aPathElements.length || !aPathElements[0]) {
			response.writeHead(400);
			response.end("No Name provided");
			return;
		}
		if(aPathElements.length > 1) {
			response.writeHead(400);
			response.end("Too many arguments");
			return;
		}
		TicketConfig.db.venue.getByName(aPathElements[0], (err, row) => {
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


	dispatchDate(request, response, aPathElements) {
		if(!aPathElements.length || !aPathElements[0]) {
			response.writeHead(400);
			response.end("No Name provided");
			return;
		}
		let sDate = aPathElements.shift();

		let sOrderDirection = getOrderDirection(aPathElements, "DESC");
		let oOrder = {
			[Venue.COL_DATE]: sOrderDirection,
			[Venue.COL_TIME]: sOrderDirection,
		};
		let iLimit = getLimit(aPathElements, null);
		TicketConfig.db.venue.getAllByDate(sDate, (err, rows) => {
			if(err) {
				response.writeHead(500);
				response.end(err.message);
			}
			else {
				response.setHeader("Content-Type", "application/json");
				response.writeHead(200);
				response.end(JSON.stringify(rows));
			}
		}, oOrder, iLimit);
	}
};

export default VenueGetDispatcher;
