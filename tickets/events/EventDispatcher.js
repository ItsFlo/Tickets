import { HttpDispatcherGroup } from "../../modules/HttpDispatcher.js";
import Events from "../Events.js";
import SseDispatcher from "../../modules/SseDispatcher.js";
import Venue from "../db/Venue.js";
import ItemCategory from "../db/ItemCategory.js";
import Item from "../db/Item.js";
import OrderEventDispatcher from "./OrderEventDispatcher.js";


class EventDispatcher extends SseDispatcher {
	constructor(eventCategory) {
		super();
		Events.addEventDispatcher(eventCategory, this);
	}
};


let eventDispatcher = new HttpDispatcherGroup(false);

eventDispatcher.addDispatcher("venue", new EventDispatcher(Venue.TABLE));
eventDispatcher.addDispatcher("itemCategory", new EventDispatcher(ItemCategory.TABLE));
eventDispatcher.addDispatcher("item", new EventDispatcher(Item.TABLE));
eventDispatcher.addDispatcher("orders", new OrderEventDispatcher());



function init() {
	Events.init();
}

export default {
	init,
	eventDispatcher,
};
