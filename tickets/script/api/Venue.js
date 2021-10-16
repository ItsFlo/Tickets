import * as Ajax from './Ajax.js';
import AjaxRequest from './Ajax.js';

function create(sName, sDate, sTime) {
	if(!sName || !sDate || !sTime) {
		return null;
	}

	let oRequestBody = {
		name: sName,
		date: sDate,
		time: sTime,
	};

	let oAjax = new AjaxRequest(Ajax.PUT);
	oAjax.open("/api/venue");
	oAjax.setJsonEncoded();
	return oAjax.send(JSON.stringify(oRequestBody));
}


function deleteVenue(id) {
	id = parseInt(id);
	if(isNaN(id)) {
		return null;
	}

	let oRequestBody = {
		id: id,
	};

	let oAjax = new AjaxRequest(Ajax.DELETE);
	oAjax.open("/api/venue");
	oAjax.setJsonEncoded();
	return oAjax.send(JSON.stringify(oRequestBody));
}


function update(id, sName, sDate, sTime) {
	let oRequestBody = {
		id: id,
	}

	let bChanges = false;
	if(sName) {
		oRequestBody.name = sName;
		bChanges = true;
	}
	if(sDate) {
		oRequestBody.date = sDate;
		bChanges = true;
	}
	if(sTime) {
		oRequestBody.time = sTime;
		bChanges = true;
	}

	if(!bChanges) {
		return new Promise((resolve, reject) => {
			reject(new Error("No changes set"));
		});
	}

	let oAjax = new AjaxRequest(Ajax.PATCH);
	oAjax.open("/api/venue");
	oAjax.setJsonEncoded();
	return oAjax.send(JSON.stringify(oRequestBody));
}



function getAll(bWithItemCount=false) {
	let sPath = "/api/venue/all";
	if(bWithItemCount) {
		sPath += "/itemCount";
	}
	sPath += "/order/desc";

	let oAjax = new AjaxRequest(Ajax.GET);
	oAjax.open(sPath);
	oAjax.setJsonEncoded();
	return oAjax.send();
}


export {
	create,
	deleteVenue as delete,
	update,
	getAll,
};
