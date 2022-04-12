import Ajax from "../Ajax.js";

const API_ENDPOINT = "/api/venue/css";

function create(venueId, css) {
	venueId = parseInt(venueId);
	if(isNaN(venueId)) {
		return Promise.reject("invalid id");
	}

	let requestBody = {
		venue: venueId,
		css: css || "",
	};
	return Ajax.sendJson(API_ENDPOINT, Ajax.PUT, requestBody);
}


function deleteVenueCss(venueId) {
	venueId = parseInt(venueId);
	if(isNaN(venueId)) {
		return Promise.reject("invalid id");
	}

	let requestBody = {
		venue: venueId,
	};
	return Ajax.sendJson(API_ENDPOINT, Ajax.DELETE, requestBody);
}


function update(venueId, css) {
	venueId = parseInt(venueId);
	if(isNaN(venueId)) {
		return Promise.reject("invalid id");
	}
	let requestBody = {
		venue: venueId,
		css: css || "",
	}
	return Ajax.sendJson(API_ENDPOINT, Ajax.PATCH, requestBody);
}



function get(venueId) {
	venueId = parseInt(venueId);
	if(isNaN(venueId)) {
		return Promise.reject("invalid id");
	}

	let params = {
		venue: venueId,
	}
	return Ajax.send(Ajax.createUrl(API_ENDPOINT, params), Ajax.GET);
}


export default {
	create,
	delete: deleteVenueCss,
	update,
	get,
};
