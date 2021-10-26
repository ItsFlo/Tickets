import Ajax from './Ajax.js';

function create(iVenueID, sName) {
	iVenueID = parseInt(iVenueID);
	if(isNaN(iVenueID) || !sName) {
		return null;
	}

	let oRequestBody = {
		venue: iVenueID,
		name: sName,
	};

	let oAjax = new Ajax.Request(Ajax.PUT);
	oAjax.open("/api/itemCategory");
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

	let oAjax = new Ajax.Request(Ajax.DELETE);
	oAjax.open("/api/itemCategory");
	oAjax.setJsonEncoded();
	return oAjax.send(JSON.stringify(oRequestBody));
}


function update(id, sName) {
	let oRequestBody = {
		id: id,
	}


	let bChanges = false;
	if(sName) {
		oRequestBody.name = sName;
		bChanges = true;
	}

	if(!bChanges) {
		return Promise.reject("No changes set");
	}

	let oAjax = new Ajax.Request(Ajax.PATCH);
	oAjax.open("/api/itemCategory");
	oAjax.setJsonEncoded();
	return oAjax.send(JSON.stringify(oRequestBody));
}



function getAll(iVenueID=null) {
	iVenueID = parseInt(iVenueID);
	let sPath = "/api/itemCategory/all";
	if(!isNaN(iVenueID)) {
		sPath += "/venue/" + iVenueID;
	}

	let oAjax = new Ajax.Request(Ajax.GET);
	oAjax.open(sPath);
	return oAjax.send();
}


export default {
	create,
	delete: deleteItem,
	update,
	getAll,
};
