import * as Ajax from './Ajax.js';
import AjaxRequest from './Ajax.js';

function create(iVenueID, sName, fPrice) {
	iVenueID = parseInt(iVenueID);
	fPrice = parseFloat(fPrice);
	if(isNaN(iVenueID) || !sName || isNaN(fPrice)) {
		return null;
	}

	let oRequestBody = {
		venue: iVenueID,
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
	if(typeof fPrice === "number" && !isNaN(fPrice)) {
		oRequestBody.price = fPrice;
		bChanges = true;
	}

	if(!bChanges) {
		return new Promise((resolve, reject) => {
			reject(new Error("No changes set"));
		});
	}

	let oAjax = new AjaxRequest(Ajax.PATCH);
	oAjax.open("/api/item");
	oAjax.setJsonEncoded();
	return oAjax.send(JSON.stringify(oRequestBody));
}



function getAll(iVenueID=null) {
	iVenueID = parseInt(iVenueID);
	let sPath = "/api/item/all";
	if(!isNaN(iVenueID)) {
		sPath += "/venue/" + iVenueID;
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
