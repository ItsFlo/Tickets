import VenueSelect from "./modules/venueSelect.js"
import { addLoadListener, getPathPart } from "./functions.js";
import NewOrder from "./checkout/newOrder.js";
import OpenOrders from "./checkout/openOrders.js";

function documentLoadListener() {
	NewOrder.init();
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

	let initialVenueName = getPathPart(1);
	VenueSelect.init(initialVenueName);
}
addLoadListener(documentLoadListener);
