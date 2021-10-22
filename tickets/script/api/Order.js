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

export default {
	create,
};
