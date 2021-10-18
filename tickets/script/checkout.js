import * as VenueSelect from "./checkout/venueSelect.js"
import { addLoadListener } from "./functions.js";

function documentLoadListener() {
	VenueSelect.init();
	VenueSelect.addListener(() => {
		console.log("new Venue:", VenueSelect.getSelectedID());
	});
}
addLoadListener(documentLoadListener);
