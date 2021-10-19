import SseDispatcher from "../../modules/SseDispatcher.js";
import Venue from "../db/Venue.js";
import Events from "../Events.js";

class VenueEventDispatcher extends SseDispatcher {
	constructor() {
		super();
		Events.addEventDispatcher(Venue.TABLE, this);
	}
};

export default VenueEventDispatcher;
