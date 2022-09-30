import Venue from "./admin/Venue.js";
import VenueEditor from "./admin/VenueEditor.js";
import { addLoadListener } from "./functions.js";

function documentLoadListener() {
	Venue.init();
	VenueEditor.init();
}
addLoadListener(documentLoadListener);
