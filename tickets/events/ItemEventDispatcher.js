import SseDispatcher from "../../modules/SseDispatcher.js";
import Item from "../db/Item.js";
import Events from "../Events.js";

class ItemEventDispatcher extends SseDispatcher {
	constructor() {
		super();
		Events.addEventDispatcher(Item.TABLE, this);
	}
};

export default ItemEventDispatcher;
