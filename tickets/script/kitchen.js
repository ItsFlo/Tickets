import VenueSelect from "./modules/venueSelect.js";
import { addLoadListener } from "./functions.js";
import ItemList from "./kitchen/ItemList.js";

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
	VenueSelect.addListener(() => {
		let venueId = VenueSelect.getSelectedID();
		if(isNaN(venueId)) {
			ItemList.clear();
		}
		else {
			ItemList.load(venueId);
		}
	});

	let initialVenueName = getInitialVenueName();
	VenueSelect.init(initialVenueName);
}
addLoadListener(documentLoadListener);
