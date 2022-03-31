import HttpDispatcher, { sendStatus } from "../../../modules/HttpDispatcher.js";
import TicketConfig from "../../TicketConfig.js";
import OrderGetter from "./OrderGetter.js";

class OrderGetDispatcher extends HttpDispatcher {
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
		TicketConfig.db.order.getByID(iID).then(row => {
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

		let venueID = searchParams.get("venue", null);
		let status = [];
		for(let searchParamStatus of searchParams.getAll("status")) {
			status.push(searchParamStatus.toUpperCase());
		}

		OrderGetter.getAll(venueID, status).then(orders => {
			response.setHeader("Content-Type", "application/json");
			response.writeHead(200);
			response.end(JSON.stringify(orders));
		}, (err) => {
			sendStatus(response, 500, err.message);
		});
	}
};

export default OrderGetDispatcher;
