import SseDispatcher from "../../modules/SseDispatcher.js";
import ItemCategory from "../db/ItemCategory.js";
import Events from "../Events.js";

class ItemCategoryEventDispatcher extends SseDispatcher {
	constructor() {
		super();
		Events.addEventDispatcher(ItemCategory.TABLE, this);
	}
};

export default ItemCategoryEventDispatcher;
