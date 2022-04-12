import Venue from "./admin/Venue.js";
import VenueCss from "./admin/VenueCss.js";
import ItemCategory from "./admin/ItemCategory.js";
import Item from "./admin/Item.js";
import { addLoadListener } from "./functions.js";

function documentLoadListener() {
	Venue.init();
	VenueCss.init();
	ItemCategory.init();
	Item.init();
}
addLoadListener(documentLoadListener);
