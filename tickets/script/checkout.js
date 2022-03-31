import VenueSelect from "./modules/venueSelect.js"
import { addLoadListener } from "./functions.js";
import NewOrder from "./checkout/newOrder.js";
import OpenOrders from "./checkout/openOrders.js";

function getInitialVenueName() {
	let pathsParts = window.location.pathname.split("/");
	let firstPart = true;
	for(let part of pathsParts) {
		if(!part) {
			continue;
		}
		if(firstPart) {
			firstPart = false;
			continue;
		}
		return part;
	}
	return null;
}

function documentLoadListener() {
	let initialVenueName = getInitialVenueName();
	VenueSelect.init(initialVenueName);
	VenueSelect.addListener(() => {
		let iVenueID = VenueSelect.getSelectedID();
		if(isNaN(iVenueID)) {
			NewOrder.clearItems();
		}
		else {
			NewOrder.loadItemCategories(iVenueID);
			OpenOrders.loadOrders(iVenueID);
		}
	});

	NewOrder.init();
}
addLoadListener(documentLoadListener);
