import { HttpDispatcherGroup } from "../../modules/HttpDispatcher.js";
import Events from "../Events.js";
import VenueEventDispatcher from "./VenueEventDispatcher.js";
import ItemCategoryEventDispatcher from "./ItemCategoryEventDispatcher.js";
import ItemEventDispatcher from "./ItemEventDispatcher.js";

let oEventDispatcher = new HttpDispatcherGroup(false);

oEventDispatcher.addDispatcher("venue", new VenueEventDispatcher());
oEventDispatcher.addDispatcher("itemCategory", new ItemCategoryEventDispatcher());
oEventDispatcher.addDispatcher("item", new ItemEventDispatcher());



function init() {
	Events.init();
}

export default {
	init,
	eventDispatcher: oEventDispatcher,
};
