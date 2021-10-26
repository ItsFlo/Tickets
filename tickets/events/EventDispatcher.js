import { HttpDispatcherGroup } from "../../modules/HttpDispatcher.js";
import Events from "../Events.js";
import SseDispatcher from "../../modules/SseDispatcher.js";
import Venue from "../db/Venue.js";
import ItemCategory from "../db/ItemCategory.js";
import Item from "../db/Item.js";
import OrderEventDispatcher from "./OrderEventDispatcher.js";


class EventDispatcher extends SseDispatcher {
	constructor(sEventCategory) {
		super();
		Events.addEventDispatcher(sEventCategory, this);
	}
};


let oEventDispatcher = new HttpDispatcherGroup(false);

oEventDispatcher.addDispatcher("venue", new EventDispatcher(Venue.TABLE));
oEventDispatcher.addDispatcher("itemCategory", new EventDispatcher(ItemCategory.TABLE));
oEventDispatcher.addDispatcher("item", new EventDispatcher(Item.TABLE));
oEventDispatcher.addDispatcher("orders", new OrderEventDispatcher());



function init() {
	Events.init();
}

export default {
	init,
	eventDispatcher: oEventDispatcher,
};
