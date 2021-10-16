import HttpDispatcher from "../../../modules/HttpDispatcher.js";
import TicketConfig from "../../TicketConfig.js";
import { getOrderDirection, getLimit } from "../functions.js";
import Item from "../../db/Item.js";

class ItemGetDispatcher extends HttpDispatcher {
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
		TicketConfig.db.item.getByID(iID, (err, row) => {
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
		let sOrderDirection = getOrderDirection(aPathElements, "ASC");;
		let oOrder = {
			[Item.COL_NAME]: sOrderDirection,
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

		let iVenueID = NaN;
		let iLen = aPathElements.length;
		for(let ii=0;ii<iLen;++ii) {
			if(ii+1 < iLen && aPathElements[ii].toUpperCase() === "VENUE") {
				iVenueID = parseInt(aPathElements[ii+1]);
				break;
			}
		}
		if(isNaN(iVenueID)) {
			TicketConfig.db.item.getAll(callback, oOrder, iLimit);
		}
		else {
			TicketConfig.db.item.getAllByVenue(iVenueID, callback, oOrder, iLimit);
		}
	}


	dispatchName(response, aPathElements) {
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

		TicketConfig.db.item.getByName(iVenueID, sName, (err, row) => {
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

export default ItemGetDispatcher;
