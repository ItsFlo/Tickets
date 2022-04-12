import Ajax from "../Ajax.js";

const API_ENDPOINT = "/api/stats";


function venue(venueId=null) {
	let path = API_ENDPOINT+"/venue";
	let params = {};
	if(venueId) {
		params.id = venueId;
	}
	return Ajax.send(Ajax.createUrl(path, params));
}

function itemCategory(venueId=null, itemCategoryId=null) {
	let path = API_ENDPOINT+"/itemCategory";
	let params = {};
	if(venueId) {
		params.venue = venueId;
	}
	if(itemCategoryId) {
		params.category = itemCategoryId;
	}
	return Ajax.send(Ajax.createUrl(path, params));
}

function item(venueId=null, itemCategoryId=null) {
	let path = API_ENDPOINT+"/item";
	let params = {};
	if(venueId) {
		params.venue = venueId;
	}
	if(itemCategoryId) {
		params.category = itemCategoryId;
	}
	return Ajax.send(Ajax.createUrl(path, params));
}

export default {
	venue,
	itemCategory,
	item,
};
