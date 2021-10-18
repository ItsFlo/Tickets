import * as Venue from './admin/Venue.js';
import * as ItemCategory from './admin/ItemCategory.js';
import * as Item from './admin/Item.js';
import { addLoadListener } from './functions.js';

function documentLoadListener() {
	Venue.init();
	ItemCategory.init();
	Item.init();
}
addLoadListener(documentLoadListener);
