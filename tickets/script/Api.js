import Ajax from './Ajax.js';
import Venue from './api/Venue.js';
import VenueCss from './api/VenueCss.js';
import ItemCategory from './api/ItemCategory.js';
import Item from './api/Item.js';
import Order from './api/Order.js';
import OrderItem from './api/OrderItem.js';
import Stats from './api/stats.js';

export default {
	HttpError: Ajax.HttpError,
	HTTP_STATUS_CODES: Ajax.HTTP_STATUS_CODES,
	getHttpStatusMessage: Ajax.getHttpStatusMessage,

	venue: Venue,
	venueCss: VenueCss,
	itemCategory: ItemCategory,
	item: Item,
	order: Order,
	orderItem: OrderItem,
	stats: Stats,
};
