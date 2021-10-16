import HttpDispatcher from "../../../modules/HttpDispatcher.js";
import TicketConfig from "../../TicketConfig.js";
import { getOrderDirection, getLimit } from "../functions.js";
import Venue from "../../db/Venue.js";

class VenueGetDispatcher extends HttpDispatcher {
	dispatch(sPath, request, response) {
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
			dispatchFunction.call(this, response, aPathElements);
		}
		else {
			response.writeHead("400");
			response.end();
		}
	}




	dispatchId(response, aPathElements) {
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


	dispatchAll(response, aPathElements) {
		let sOrderDirection = getOrderDirection(aPathElements, "DESC");;
		let oOrder = {
			[Venue.COL_DATE]: sOrderDirection,
			[Venue.COL_TIME]: sOrderDirection,
		};
		let iLimit = getLimit(aPathElements, null);
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

		let bWithItemCount = false;
		for(let sPart of aPathElements) {
			if(sPart.toUpperCase() === "ITEMCOUNT") {
				bWithItemCount = true;
				break;
			}
		}
		if(bWithItemCount) {
			TicketConfig.db.venue.getAllWithItemCount(callback, oOrder, iLimit);
		}
		else {
			TicketConfig.db.venue.getAll(callback, oOrder, iLimit);
		}
	}


	dispatchName(response, aPathElements) {
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


	dispatchDate(response, aPathElements) {
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
