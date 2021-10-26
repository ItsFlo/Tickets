import VenueSelect from "./checkout/venueSelect.js"
import { addLoadListener } from "./functions.js";
import NewOrder from "./checkout/newOrder.js";
import OpenOrders from "./checkout/openOrders.js";

function documentLoadListener() {
	VenueSelect.init();
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
