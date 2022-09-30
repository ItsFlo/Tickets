import Venue from './Venue.js';
import Item from "./Item.js";
import VenueCss from "./VenueCss.js";
import ItemCategory from './ItemCategory.js';
import Api from '../Api.js';
import Error from '../Error.js';

let iCurrentVenueId = null;
function currentVenueId() {
	return iCurrentVenueId;
}

async function open(iVenueId) {
	iVenueId = parseInt(iVenueId);
	if(isNaN(iVenueId)) {
		clear();
		return;
	}
	let oVenue = Venue.getElement(iVenueId);
	if(!oVenue) {
		close();
		return;
	}

	let oEditor = document.getElementById("itemEditor");
	if(iVenueId !== iCurrentVenueId) {
		oEditor.querySelector(".venueName .name").textContent = oVenue.querySelector(".name:not(input)").textContent.trim();
		oEditor.querySelector(".venueName .id").textContent = iVenueId;

		iCurrentVenueId = iVenueId;
		oEditor.dataset.venueId = iVenueId;
		if(oVenue.nextElementSibling) {
			oVenue.parentElement.insertBefore(oEditor, oVenue.nextElementSibling);
		}
		else {
			oVenue.parentElement.appendChild(oEditor);
		}

		let itemPromise = Item.loadVenue(iVenueId);
		let cssPromise = VenueCss.load(iVenueId);
		await itemPromise;
		await cssPromise;
	}
	oEditor.classList.add("visible");
}
function close() {
	let oEditor = document.getElementById("itemEditor");
	oEditor.classList.remove("visible");
}
function clear() {
	Item.clear();
	VenueCss.clear();
	ItemCategory.clearNewItemCategoryForm();
	iCurrentVenueId = null;
}
function isOpen() {
	let oEditor = document.getElementById("itemEditor");
	return oEditor.classList.contains("visible");
}


function clearOrdersListener() {
	if(iCurrentVenueId === null) {
		return;
	}
	let venue = Venue.getElement(iCurrentVenueId);
	if(!venue) {
		return;
	}
	let name = venue.querySelector(".name").textContent.trim();
	if(window.confirm(`Alle Bestellungen für ${name} löschen?`)) {
		Api.venue.clearOrders(iCurrentVenueId).catch(Error.show);
	}
}


function init() {
	ItemCategory.init();
	Item.init();
	VenueCss.init();

	let clearOrdersButton = document.getElementById("clearOrdersButton");
	clearOrdersButton.addEventListener("click", clearOrdersListener);
}

export default {
	init,
	currentVenueId,

	open,
	close,
	clear,
	isOpen,
};
