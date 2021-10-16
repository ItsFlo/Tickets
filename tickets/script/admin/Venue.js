import * as Api from '../Api.js';
import * as Error from '../Error.js';
import * as Item from './Item.js';
import { SORT_DESC, insertSorted } from '../functions.js';

function stopPropagationListener(ev) {
	ev.stopPropagation();
}

function newVenueListener(ev) {
	ev.preventDefault();

	let sDate = document.getElementById("newVenueDate").value;
	let sTime = document.getElementById("newVenueTime").value;
	let sName = document.getElementById("newVenueName").value;

	Api.venue.create(sName, sDate, sTime).then((oResponse) => {
		let iID = oResponse.json.id;
		let oVenueElement = createElement({
			id: iID,
			name: sName,
			date: sDate,
			time: sTime,
			itemCount: 0,
		});
		insertElement(oVenueElement);
	}).catch((error) => {
		Error.show(error);
	});
}




function saveEditListener(ev) {
	ev.stopPropagation();
	ev.preventDefault();
	let oVenue = this.closest(".venue");
	let iID = parseInt(oVenue.dataset.venueId);
	if(isNaN(iID)) {
		abortEditVenue(oVenue);
		return;
	}

	let sNewName = oVenue.querySelector("input.name").value.trim();
	let sNewDate = oVenue.querySelector("input.date").value.trim();
	let sNewTime = oVenue.querySelector("input.time").value.trim();

	let oOldName = oVenue.querySelector(".name:not(input)");
	let oOldDate = oVenue.querySelector(".date:not(input)");
	let oOldTime = oVenue.querySelector(".time:not(input)");

	let bChanges = false;
	let bReInsert = false;
	if(sNewName !== oOldName.textContent.trim()) {
		bChanges = true;
	}
	else {
		sNewName = null;
	}

	if(sNewDate !== oOldDate.textContent.trim()) {
		bChanges = true;
		bReInsert = true;
	}
	else {
		sNewDate = null;
	}

	if(sNewTime !== oOldTime.textContent.trim()) {
		bChanges = true;
		bReInsert = true;
	}
	else {
		sNewTime = null;
	}

	if(bChanges) {
		Api.venue.update(iID, sNewName, sNewDate, sNewTime).then(() => {
			if(sNewName) {
				oOldName.innerHTML = sNewName;
				Item.updateVenueName();
			}
			if(sNewDate) {
				oOldDate.innerHTML = sNewDate;
			}
			if(sNewTime) {
				oOldTime.innerHTML = sNewTime;
			}
			if(sNewDate || sNewTime) {
				oVenue.dataset.dateTime = oOldDate.textContent.trim()+"T"+oOldTime.textContent.trim();
			}
			abortEditVenue(oVenue);
			if(bReInsert) {
				insertElement(oVenue);
			}
		}).catch((error) => {
			Error.show(error);
			abortEditVenue(oVenue);
		})
	}
	else {
		abortEditVenue(oVenue);
	}
}
function abortEditListener(ev) {
	ev.stopPropagation();
	let oVenue = this.closest(".venue");
	abortEditVenue(oVenue);
}


function editVenue(oVenue) {
	let oName = oVenue.querySelector(".name");
	let iVenueID = parseInt(oVenue.dataset.venueId);
	let sFormID = "editVenueForm_" + iVenueID;

	let oEditButtons = document.createElement("div");
	oEditButtons.classList.add("buttons");
	oEditButtons.classList.add("edit");

	let oDoneButton = document.createElement("button");
	oDoneButton.classList.add("button");
	oDoneButton.setAttribute("type", "submit");
	oDoneButton.setAttribute("form", sFormID);
	oDoneButton.addEventListener("click", stopPropagationListener);
	oEditButtons.appendChild(oDoneButton);
	let oDoneButtonIcon = document.createElement("img");
	oDoneButtonIcon.setAttribute("src", "/image/done_icon.svg");
	oDoneButtonIcon.setAttribute("height", "100%");
	oDoneButton.appendChild(oDoneButtonIcon);

	let oClearButton = document.createElement("img");
	oClearButton.classList.add("button");
	oClearButton.setAttribute("src", "/image/clear_icon.svg");
	oClearButton.addEventListener("click", abortEditListener);
	oEditButtons.appendChild(oClearButton);


	let oForm = document.createElement("form");
	oForm.id = sFormID;
	oForm.addEventListener("submit", saveEditListener);


	let oNameInput = document.createElement("input");
	oNameInput.classList.add("name");
	oNameInput.setAttribute("type", "text");
	oNameInput.setAttribute("required", "required");
	oNameInput.setAttribute("placeholder", "Name");
	oNameInput.setAttribute("form", sFormID);
	oNameInput.addEventListener("click", stopPropagationListener);
	oNameInput.value = oName.textContent.trim();

	let oDateInput = document.createElement("input");
	oDateInput.classList.add("date");
	oDateInput.setAttribute("type", "date");
	oDateInput.setAttribute("required", "required");
	oDateInput.addEventListener("click", stopPropagationListener);
	oDateInput.setAttribute("form", sFormID);
	oDateInput.value = oVenue.querySelector(".date").textContent.trim();

	let oTimeInput = document.createElement("input");
	oTimeInput.classList.add("time");
	oTimeInput.setAttribute("type", "time");
	oTimeInput.setAttribute("required", "required");
	oTimeInput.addEventListener("click", stopPropagationListener);
	oTimeInput.setAttribute("form", sFormID);
	oTimeInput.value = oVenue.querySelector(".time").textContent.trim();


	oVenue.insertBefore(oEditButtons, oName);
	oVenue.insertBefore(oForm, oName);
	oVenue.insertBefore(oNameInput, oName);
	oVenue.insertBefore(oDateInput, oName);
	oVenue.insertBefore(oTimeInput, oName);
	oVenue.classList.add("edit");
}

function abortEditVenue(oVenue) {
	let oButtons = oVenue.querySelector(".buttons.edit");
	if(oButtons) {
		oButtons.remove();
	}

	let oForm = oVenue.querySelector("form");
	if(oForm) {
		oForm.remove();
	}

	let aInputs = Array.from(oVenue.getElementsByTagName("input"));
	for(let oInput of aInputs) {
		oInput.remove();
	}

	oVenue.classList.remove("edit");
}


function editListener(ev) {
	ev.stopPropagation();
	let oVenue = this.closest(".venue");

	editVenue(oVenue);
}

function deleteListener(ev) {
	ev.stopPropagation();
	let oVenue = this.closest(".venue");
	let iID = parseInt(oVenue.dataset.venueId);
	let sName = oVenue.querySelector(".name").textContent.trim();

	Item.closeEditor();

	if(window.confirm(`Veranstaltung "${sName}" wirklich löschen?`)) {
		Api.venue.delete(iID).then(() => {
			oVenue.remove();
		}).catch((error) => {
			Error.show(error);
		});
	}
}



function venueClickListener(ev) {
	Item.openEditor(this.dataset.venueId);
}

function createElement(oVenue=null) {
	let oElement = document.createElement("div");
	oElement.classList.add("venue");
	oElement.addEventListener("click", venueClickListener);

	let oButtonContainer = document.createElement("div");
	oButtonContainer.classList.add("buttons");
	oElement.appendChild(oButtonContainer);

	let oEditButton = document.createElement("img");
	oEditButton.classList.add("button");
	oEditButton.setAttribute("src", "/image/edit_icon.svg");
	oEditButton.addEventListener("click", editListener);
	oButtonContainer.appendChild(oEditButton);

	let oDeleteButton = document.createElement("img");
	oDeleteButton.classList.add("button");
	oDeleteButton.setAttribute("src", "/image/delete_icon.svg");
	oDeleteButton.addEventListener("click", deleteListener);
	oButtonContainer.appendChild(oDeleteButton);



	let oName = document.createElement("div");
	oName.classList.add("name");
	oElement.appendChild(oName);

	let oStats = document.createElement("div");
	oStats.classList.add("stats");
	oElement.appendChild(oStats);


	//stats
	let oDate = document.createElement("span");
	oDate.classList.add("date");

	let oTime = document.createElement("span");
	oTime.classList.add("time");

	let oItemCount = document.createElement("span");
	oItemCount.classList.add("itemCount");

	oStats.appendChild(oDate);
	oStats.appendChild(oTime);
	oStats.appendChild(oItemCount);

	if(oVenue) {
		oElement.dataset.venueId = oVenue.id;
		oElement.dataset.dateTime = oVenue.date+"T"+oVenue.time;
		oName.innerHTML = oVenue.name;
		oDate.innerHTML = oVenue.date;
		oTime.innerHTML = oVenue.time;
		oItemCount.innerHTML = oVenue.itemCount;
	}

	return oElement;
}


function insertElement(oVenueElement) {
	if(!oVenueElement.classList.contains("venue")) {
		return;
	}
	Item.closeEditor();
	let oVenueTable = document.getElementById("venueTable");

	insertSorted(oVenueTable, oVenueElement, SORT_DESC, null, "data-date-time", "venue");
}

function getElement(iVenueID) {
	return document.getElementById("venueTable").querySelector(".venue[data-venue-id=\""+iVenueID+"\"");
}


function updateItemCount(iVenueID, iDirection) {
	let oVenue = getElement(iVenueID);
	if(oVenue) {
		let oItemCount = oVenue.querySelector(".itemCount");
		let iItemCount = parseInt(oItemCount.textContent.trim());
		if(!isNaN(iItemCount)) {
			if(iDirection > 0) {
				iItemCount += 1;
			}
			else if(iDirection < 0) {
				iItemCount -= 1;
			}

			if(iItemCount < 0) {
				iItemCount = 0;
			}
			oItemCount.innerHTML = iItemCount;
		}
	}
}
function incrementUpdateCount(iVenueID) {
	updateItemCount(iVenueID, +1);
}
function decrementUpdateCount(iVenueID) {
	updateItemCount(iVenueID, -1);
}




function clearVenues() {
	let oVenueTable = document.getElementById("venueTable");
	let aVenues = oVenueTable.getElementsByClassName("venue");
	for(let oVenueElement of aVenues) {
		oVenueElement.remove();
	}
}

function loadAllVenues() {
	clearVenues();
	Api.venue.getAll(true).then((oResponse) => {
		let aVenues = oResponse.json;
		let oVenueTable = document.getElementById("venueTable");

		for(let oVenue of aVenues) {
			let oVenueElement = createElement(oVenue);
			oVenueTable.appendChild(oVenueElement);
		}
	}).catch((error) => {
		Error.show(error);
	});
}


function init() {
	document.getElementById("newVenueForm").addEventListener("submit", newVenueListener);
	loadAllVenues();
}



export {
	init,

	createElement,
	insertElement,
	getElement,

	incrementUpdateCount,
	decrementUpdateCount,
};
