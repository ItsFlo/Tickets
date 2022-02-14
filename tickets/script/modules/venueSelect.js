import Ajax from "../Ajax.js";
import Api from "../Api.js";
import Error from "../Error.js";
import { SORT_DESC, insertSorted } from "../functions.js";

const STYLE_HREF = "/style/modules/venueSelect.css";


let aListeners = [];

function addListener(listener) {
	if(typeof listener !== "function") {
		return;
	}
	if(!aListeners.includes(listener)) {
		aListeners.push(listener);
	}
}
function removeListener(listener) {
	if(typeof listener !== "function") {
		return;
	}
	let iIndex = aListeners.indexOf(listener);
	if(iIndex > -1) {
		aListeners.splice(iIndex, 1);
	}
}


function escapeKeyListener(ev) {
	if(ev.key === "Escape") {
		close();
	}
}

function open() {
	let oVenueSelect = document.getElementById("venueSelect");
	oVenueSelect.classList.add("edit");
	document.addEventListener("keyup", escapeKeyListener);
}
function close() {
	let oVenueSelect = document.getElementById("venueSelect");
	oVenueSelect.classList.remove("edit");
	document.removeEventListener("keyup", escapeKeyListener);
}
function toggleOpenClosed() {
	let oVenueSelect = document.getElementById("venueSelect");
	oVenueSelect.classList.toggle("edit");
	if(oVenueSelect.classList.contains("edit")) {
		document.addEventListener("keyup", escapeKeyListener);
	}
	else {
		document.removeEventListener("keyup", escapeKeyListener);
	}
}


function clear() {
	let oVenueSelect = document.getElementById("venueSelect");

	let oSelected = document.getElementById("selectedVenue");
	oSelected.querySelector(".name").innerHTML = "";
	oSelected.querySelector(".date").innerHTML = "";
	oSelected.querySelector(".time").innerHTML = "";

	let oOptionContainer = oVenueSelect.querySelector(".venue-options");
	while(oOptionContainer.firstChild) {
		oOptionContainer.firstChild.remove();
	}
}



function optionClickListener() {
	if(this.classList.contains("selected")) {
		return;
	}
	selectOption(this);
	close();
}


function createOption(oVenue) {
	let oOption = document.createElement("option");
	oOption.classList.add("venue-option")
	oOption.addEventListener("click", optionClickListener);

	let oName = document.createElement("div");
	oName.classList.add("name");

	let oDate = document.createElement("span");
	oDate.classList.add("date");

	let oTime = document.createElement("span");
	oTime.classList.add("time");


	oOption.appendChild(oName);
	oOption.appendChild(oDate);
	oOption.appendChild(oTime);

	oOption.dataset.venueId = oVenue.id;
	oOption.dataset.dateTime = oVenue.date + "T" + oVenue.time;
	oName.innerHTML = oVenue.name;
	oDate.innerHTML = oVenue.date;
	oTime.innerHTML = oVenue.time;

	return oOption;
}

function insertOption(oOption) {
	let oVenueSelect = document.getElementById("venueSelect");
	let oOptionContainer = oVenueSelect.querySelector(".venue-options");

	insertSorted(oOptionContainer, oOption, SORT_DESC, null, "data-date-time", "venue-option");
}

function getOption(iVenueID) {
	let oOptionContainer = document.querySelector("#venueSelect .venue-options");
	return oOptionContainer.querySelector(".venue-option[data-venue-id=\""+iVenueID+"\"]");
}

function getClosestOption(oDate) {
	if(!oDate instanceof Date) {
		return null;
	}
	let oLastOption = null;
	let iLastDistance = null;

	let oOptionContainer = document.querySelector("#venueSelect .venue-options");
	let oOptions = oOptionContainer.querySelectorAll(".venue-option");
	for(let oOption of oOptions) {
		let oOptionDate = new Date(oOption.dataset.dateTime);
		if(oOptionDate < oDate) {
			if(iLastDistance !== null) {
				if(oDate - oOptionDate < iLastDistance) {
					return oOption;
				}
				return oLastOption;
			}
			return oOption;
		}

		oLastOption = oOption;
		iLastDistance = oOptionDate - oDate;
	}

	return oLastOption;
}


function selectOption(oOption) {
	let oVenueSelect = document.querySelector("#venueSelect");

	let oSelected = oVenueSelect.querySelectorAll(".venue-option.selected");
	for(let oSelectedElement of oSelected) {
		oSelectedElement.classList.remove("selected");
	}
	oOption.classList.add("selected");

	let oSelectedVenue = document.getElementById("selectedVenue");
	oSelectedVenue.querySelector(".name").innerHTML = oOption.querySelector(".name").textContent.trim();
	oSelectedVenue.querySelector(".date").innerHTML = oOption.querySelector(".date").textContent.trim();
	oSelectedVenue.querySelector(".time").innerHTML = oOption.querySelector(".time").textContent.trim();


	if(oVenueSelect.dataset.venueId != oOption.dataset.venueId) {
		oVenueSelect.dataset.venueId = oOption.dataset.venueId;
		for(let listener of aListeners) {
			listener.call(oVenueSelect);
		}
	}
}

function getSelectedID() {
	let oVenueSelect = document.querySelector("#venueSelect");
	let iID = parseInt(oVenueSelect.dataset.venueId);
	if(isNaN(iID)) {
		return null;
	}
	return iID;
}



function loadVenues() {
	clear();

	Api.venue.getAll(false).then(oResponse => {
		let aVenues = oResponse.json;
		for(let oVenue of aVenues) {
			let oOption = createOption(oVenue);
			insertOption(oOption);
		}

		let oOption = null;
		let iSelectedID = getSelectedID();
		if(iSelectedID !== null) {
			oOption = getOption(iSelectedID);
		}

		if(!oOption) {
			oOption = getClosestOption(new Date());
		}

		if(oOption) {
			selectOption(oOption);
		}
	}).catch(error => {
		Error.show(error);
	});
}



function editButtonListener() {
	toggleOpenClosed();
}

function loadTemplate() {
	return Ajax.send("/template/venueSelect.html").then(response => {
		let parser = new DOMParser();
		let doc = parser.parseFromString(response.text, "text/html");
		return doc.body.firstElementChild;
	});
}

let bInitialized = false;
function init() {
	if(bInitialized) {
		return;
	}
	bInitialized = true;

	let styleLink = document.createElement("link");
	styleLink.setAttribute("type", "text/css");
	styleLink.setAttribute("rel", "stylesheet");
	styleLink.setAttribute("href", STYLE_HREF);
	document.head.appendChild(styleLink);

	loadTemplate().then(element => {
		let oVenueSelect = document.getElementById("venueSelect");
		oVenueSelect.replaceWith(element);

		document.querySelector("#selectedVenue .edit-button").addEventListener("click", editButtonListener);
		loadVenues();
	});
}


export default {
	loadTemplate,
	init,

	addListener,
	removeListener,

	open,
	close,
	toggleOpenClosed,

	clear,
	loadVenues,

	createOption,
	insertOption,
	getOption,
	selectOption,
	getSelectedID,
};
