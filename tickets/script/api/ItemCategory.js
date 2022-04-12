import Ajax from "../Ajax.js";

const API_ENDPOINT = "/api/itemCategory";

function create(venueId, name) {
	venueId = parseInt(venueId);
	if(isNaN(venueId) || !name) {
		return Promise.reject("invalid id");
	}

	let requestBody = {
		venue: venueId,
		name: name,
	};

	return Ajax.sendJson(API_ENDPOINT, Ajax.PUT, requestBody);
}


function deleteItem(id) {
	id = parseInt(id);
	if(isNaN(id)) {
		return Promise.reject("invalid id");
	}

	let requestBody = {
		id: id,
	};

	return Ajax.sendJson(API_ENDPOINT, Ajax.DELETE, requestBody);
}


function update(id, name) {
	let requestBody = {
		id: id,
	}


	let hasChanges = false;
	if(name) {
		requestBody.name = name;
		hasChanges = true;
	}

	if(!hasChanges) {
		return Promise.reject("No changes set");
	}

	return Ajax.sendJson(API_ENDPOINT, Ajax.PATCH, requestBody);
}



function getAll(venueID=null) {
	let path = API_ENDPOINT+"/all";
	let params = {};

	venueID = parseInt(venueID);
	if(!isNaN(venueID)) {
		params.venue = venueID;
	}
	path = Ajax.createUrl(path, params);

	return Ajax.send(path, Ajax.GET);
}


export default {
	create,
	delete: deleteItem,
	update,
	getAll,
};
