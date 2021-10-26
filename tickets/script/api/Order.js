import Ajax from "./Ajax.js";

function create(iVenueID, aItems) {
	iVenueID = parseInt(iVenueID);
	if(isNaN(iVenueID)) {
		return Promise.reject();
	}

	let oRequestBody = {
		venue: iVenueID,
		items: aItems,
	};

	let oAjax = new Ajax.Request(Ajax.PUT);
	oAjax.open("/api/order");
	oAjax.setJsonEncoded();
	return oAjax.send(JSON.stringify(oRequestBody));
}


function setDone(iOrderID) {
	let oRequestBody = {
		id: iOrderID,
	};

	let oAjax = new Ajax.Request(Ajax.PATCH);
	oAjax.open("/api/order/done");
	oAjax.setJsonEncoded();
	return oAjax.send(JSON.stringify(oRequestBody));
}
function setPickup(iOrderID) {
	let oRequestBody = {
		id: iOrderID,
	};

	let oAjax = new Ajax.Request(Ajax.PATCH);
	oAjax.open("/api/order/pickup");
	oAjax.setJsonEncoded();
	return oAjax.send(JSON.stringify(oRequestBody));
}


function getAllOpenAndDoneOrders(iVenueID=null) {
	iVenueID = parseInt(iVenueID);

	let sPath = "/api/order/all/status/open/status/done";
	if(!isNaN(iVenueID)) {
		sPath += "/venue/" + iVenueID;
	}

	let oAjax = new Ajax.Request(Ajax.GET);
	oAjax.open(sPath);
	return oAjax.send();
}

export default {
	create,
	setDone,
	setPickup,

	getAllOpenAndDoneOrders,
};
