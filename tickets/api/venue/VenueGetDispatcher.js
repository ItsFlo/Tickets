import { HttpDispatcherFunction, sendStatus, getSearchParams, splitPath, HttpDispatcherGroup } from "../../../modules/HttpDispatcher.js";
import TicketConfig from "../../TicketConfig.js";
import { getOrderDirection, getLimit } from "../functions.js";
import Venue from "../../db/Venue.js";
import VenueClearOrdersDispatcher from "./VenueClearOrdersDispatcher.js";


function requestFunction(path, request, response) {
	if(!path) {
		dispatchClosestVenue(request, response);
		return;
	}
	let pathElements = splitPath(path);
	let dispatchFunction = null;

	switch(pathElements[0].toUpperCase()) {
		case "ID":
			dispatchFunction = dispatchId;
			break;

		case "ALL":
			dispatchFunction = dispatchAll;
			break;

		case "NAME":
			dispatchFunction = dispatchName;
			break;

		case "DATE":
			dispatchFunction = dispatchDate;
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

function dispatchClosestVenue(request, response) {
	let searchParams = getSearchParams(request, false);
	let date = new Date();
	if(searchParams.has("date")) {
		let tempDate = new Date(searchParams.get("date"));
		if(!isNaN(tempDate.valueOf())) {
			date = tempDate;
		}
	}

	try {
		let venue = TicketConfig.db.venue.getClosestToDate(date);
		response.setHeader("Content-Type", "application/json");
		response.writeHead(200);
		response.end(JSON.stringify(venue));
	} catch (err) {
		sendStatus(response, 500, err.message);
	}
}


function dispatchId(request, response, pathElements) {
	if(pathElements.length > 1) {
		sendStatus(response, 400, "Too many arguments");
		return;
	}
	if(!pathElements.length || isNaN(parseInt(pathElements[0]))) {
		sendStatus(response, 400, "No ID provided");
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


function dispatchAll(request, response, pathElements) {
	let searchParams = getSearchParams(request, false);

	let orderDirection = getOrderDirection(searchParams, "DESC");
	let order = {
		[Venue.COL_DATE]: orderDirection,
		[Venue.COL_TIME]: orderDirection,
	};
	let limit = getLimit(searchParams, null);

	let includeItemCount = searchParams.get("itemCount", "").toUpperCase() === "TRUE";

	try {
		let rows;
		if(includeItemCount) {
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


function dispatchName(request, response, pathElements) {
	if(pathElements.length > 1) {
		sendStatus(response, 400, "Too many arguments");
		return;
	}
	if(!pathElements.length || !pathElements[0]) {
		sendStatus(response, 400, "No Name provided");
		return;
	}
	let name = pathElements[0];

	try {
		let venue = TicketConfig.db.venue.getByName(name, false);
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


function dispatchDate(request, response, pathElements) {
	let searchParams = getSearchParams(request, false);

	if(!searchParams.get("date", null)) {
		sendStatus(response, 400, "No date provided");
		return;
	}
	let date = searchParams.get("date");

	let orderDirection = getOrderDirection(searchParams, "DESC");
	let order = {
		[Venue.COL_DATE]: orderDirection,
		[Venue.COL_TIME]: orderDirection,
	};
	let limit = getLimit(searchParams, null);

	try {
		let venues = TicketConfig.db.venue.getAllByDate(date, order, limit);
		response.setHeader("Content-Type", "application/json");
		response.writeHead(200);
		response.end(JSON.stringify(venues));
	} catch (err) {
		sendStatus(response, 500, err.message);
	}
}


let fallbackDispatcher = new HttpDispatcherFunction(requestFunction);

class VenueGetDispatcher extends HttpDispatcherGroup {
	constructor() {
		super();
		this.addDispatcher("clearOrders", new VenueClearOrdersDispatcher());
		this.setFallbackDispatcher(fallbackDispatcher);
	}
};

export default VenueGetDispatcher;
