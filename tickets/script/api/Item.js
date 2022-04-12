import Ajax from "../Ajax.js";

const API_ENDPOINT = "/api/item";

function create(itemCategoryId, name, price) {
	itemCategoryId = parseInt(itemCategoryId);
	price = parseFloat(price);
	if(isNaN(itemCategoryId) || !name || isNaN(price)) {
		return Promise.reject("invalid arguments");
	}

	let requestBody = {
		itemCategory: itemCategoryId,
		name: name,
		price: price,
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


function update(id, name, price) {
	let requestBody = {
		id: id,
	}
	price = parseFloat(price);


	let hasChanges = false;
	if(name) {
		requestBody.name = name;
		hasChanges = true;
	}
	if(!isNaN(price)) {
		requestBody.price = price;
		hasChanges = true;
	}

	if(!hasChanges) {
		return Promise.reject("No changes set");
	}

	return Ajax.sendJson(API_ENDPOINT, Ajax.PATCH, requestBody);
}



function getAll(itemCategoryID=null) {
	let path = API_ENDPOINT+"/all";
	let params = {};

	itemCategoryID = parseInt(itemCategoryID);
	if(!isNaN(itemCategoryID)) {
		params.itemCategory = itemCategoryID;
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
