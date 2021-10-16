import * as Api from '../Api.js';
import * as Error from '../Error.js';
import * as Item from './Item.js';
import { SORT_DESC, insertSorted } from '../functions.js';

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





function editListener(ev) {
	ev.stopPropagation();
	
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
