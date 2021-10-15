import { HttpMethodDispatcher } from "../../modules/HttpDispatcher.js";
import VenuePutDispatcher from "./venue/VenuePutDispatcher.js";
import VenueDeleteDispatcher from "./venue/VenueDeleteDispatcher.js";
import VenuePatchDispatcher from "./venue/VenuePatchDispatcher.js";
import VenueGetDispatcher from "./venue/VenueGetDispatcher.js";



let oVenueDispatcher = new HttpMethodDispatcher();
oVenueDispatcher.setPutDispatcher(new VenuePutDispatcher());
oVenueDispatcher.setDeleteDispatcher(new VenueDeleteDispatcher());
oVenueDispatcher.setPatchDispatcher(new VenuePatchDispatcher());
oVenueDispatcher.setGetDispatcher(new VenueGetDispatcher());

export default oVenueDispatcher;
