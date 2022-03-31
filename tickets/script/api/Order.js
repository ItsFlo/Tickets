import Ajax from "../Ajax.js";

const API_ENDPOINT = "/api/order";

const STATUS_OPEN = "OPEN";
const STATUS_PREPARED = "PREPARED";
const STATUS_PICKEDUP = "PICKEDUP";
const STATUS_CANCELED = "CANCELED";
const STATUS = [
	STATUS_OPEN,
	STATUS_PREPARED,
	STATUS_PICKEDUP,
	STATUS_CANCELED,
];

function create(venueID, items) {
	venueID = parseInt(venueID);
	if(isNaN(venueID)) {
		return Promise.reject();
	}

	let requestBody = {
		venue: venueID,
		items: items,
	};

	return Ajax.sendJson(API_ENDPOINT, Ajax.PUT, requestBody);
}


function setOrderStatus(orderID, status) {
	let requestBody = {
		id: orderID,
	};

	let path = API_ENDPOINT + "/" + status.toLowerCase();
	return Ajax.sendJson(path, Ajax.PATCH, requestBody);
}
function setPrepared(orderId) {
	return setOrderStatus(orderId, STATUS_PREPARED);
}
function setPickedUp(orderId) {
	return setOrderStatus(orderId, STATUS_PICKEDUP);
}
function cancel(orderId) {
	return setOrderStatus(orderId, STATUS_CANCELED);
}


function getAll(venueID=null, status=[]) {
	let params = {};

	venueID = parseInt(venueID);
	if(!isNaN(venueID)) {
		params.venue = venueID;
	}
	if(Array.isArray(status) && status.length) {
		params.status = status;
	}

	let path = Ajax.createUrl(API_ENDPOINT+"/all", params);
	return Ajax.send(path, Ajax.GET);
}

export default {
	STATUS_OPEN,
	STATUS_PREPARED,
	STATUS_PICKEDUP,
	STATUS_CANCELED,
	STATUS,

	create,
	setPrepared,
	setPickedUp,
	cancel,

	getAll,
};
