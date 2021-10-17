import * as Ajax from './Ajax.js';
import AjaxRequest from './Ajax.js';

function create(iItemCategoryID, sName, fPrice) {
	iItemCategoryID = parseInt(iItemCategoryID);
	fPrice = parseFloat(fPrice);
	if(isNaN(iItemCategoryID) || !sName || isNaN(fPrice)) {
		return null;
	}

	let oRequestBody = {
		itemCategory: iItemCategoryID,
		name: sName,
		price: fPrice,
	};

	let oAjax = new AjaxRequest(Ajax.PUT);
	oAjax.open("/api/item");
	oAjax.setJsonEncoded();
	return oAjax.send(JSON.stringify(oRequestBody));
}


function deleteItem(id) {
	id = parseInt(id);
	if(isNaN(id)) {
		return null;
	}

	let oRequestBody = {
		id: id,
	};

	let oAjax = new AjaxRequest(Ajax.DELETE);
	oAjax.open("/api/item");
	oAjax.setJsonEncoded();
	return oAjax.send(JSON.stringify(oRequestBody));
}


function update(id, sName, fPrice) {
	let oRequestBody = {
		id: id,
	}
	fPrice = parseFloat(fPrice);


	let bChanges = false;
	if(sName) {
		oRequestBody.name = sName;
		bChanges = true;
	}
	if(!isNaN(fPrice)) {
		oRequestBody.price = fPrice;
		bChanges = true;
	}

	if(!bChanges) {
		return Promise.reject("No changes set");
	}

	let oAjax = new AjaxRequest(Ajax.PATCH);
	oAjax.open("/api/item");
	oAjax.setJsonEncoded();
	return oAjax.send(JSON.stringify(oRequestBody));
}



function getAll(iItemCategoryID=null) {
	iItemCategoryID = parseInt(iItemCategoryID);
	let sPath = "/api/item/all";
	if(!isNaN(iItemCategoryID)) {
		sPath += "/itemCategory/" + iItemCategoryID;
	}

	let oAjax = new AjaxRequest(Ajax.GET);
	oAjax.open(sPath);
	oAjax.setJsonEncoded();
	return oAjax.send();
}


export {
	create,
	deleteItem as delete,
	update,
	getAll,
};
