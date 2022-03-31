import { HttpMethodDispatcher } from "../../modules/HttpDispatcher.js";
import VenuePutDispatcher from "./venue/VenuePutDispatcher.js";
import VenueDeleteDispatcher from "./venue/VenueDeleteDispatcher.js";
import VenuePatchDispatcher from "./venue/VenuePatchDispatcher.js";
import VenueGetDispatcher from "./venue/VenueGetDispatcher.js";



let venueDispatcher = new HttpMethodDispatcher();
venueDispatcher.setPutDispatcher(new VenuePutDispatcher());
venueDispatcher.setDeleteDispatcher(new VenueDeleteDispatcher());
venueDispatcher.setPatchDispatcher(new VenuePatchDispatcher());
venueDispatcher.setGetDispatcher(new VenueGetDispatcher());

export default venueDispatcher;
