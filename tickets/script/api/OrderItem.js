import Ajax from "../Ajax.js";

const API_ENDPOINT = "/api/orderItem";


function getAllForOrder(orderId) {
	let path = API_ENDPOINT+"/all";
	let params = {};

	orderId = parseInt(orderId);
	if(isNaN(orderId)) {
		return Promise.reject("No orderId provided");
	}
	params.order = orderId;
	path = Ajax.createUrl(path, params);

	return Ajax.send(path, Ajax.GET);
}

function getAllForVenue(venueId, status=null) {
	let path = API_ENDPOINT+"/all";
	let params = {};

	venueId = parseInt(venueId);
	if(isNaN(venueId)) {
		return Promise.reject("No venueId provided");
	}
	params.venue = venueId;

	if(typeof status === "string" || Array.isArray(status)) {
		params.status = status;
	}

	path = Ajax.createUrl(path, params);
	return Ajax.send(path, Ajax.GET);
}

function getAll() {
	let path = API_ENDPOINT+"/all";
	return Ajax.send(path, Ajax.GET);
}


export default {
	getAllForOrder,
	getAllForVenue,
	getAll,
};
