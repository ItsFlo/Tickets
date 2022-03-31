import TicketConfig from "../../TicketConfig.js";
import Order from "../../db/Order.js";
import Item from "../../db/Item.js";

function getAllItems(orderID) {
	return TicketConfig.db.item.getAllForOrder(orderID, Item.COL_NAME);
}
function addItemsToOrder(order) {
	let items = getAllItems(order.id);
	order.items = items;
	return order;
}

function getOrder(orderID) {
	let order = TicketConfig.db.order.getByID(orderID);
	if(!order) {
		return order;
	}

	return addItemsToOrder(order);
}




function getAll(venueID=null, status=null, sortOrder=null, limit=null) {
	if(!sortOrder) {
		sortOrder = Order.COL_ORDER_TIMESTAMP;
	}
	let orders = TicketConfig.db.order.getAllByVenueStatus(venueID, status, sortOrder, limit);
	for(let order of orders) {
		addItemsToOrder(order);
	}
	return orders;
}


export default {
	getOrder,

	getAllItems,
	getAll,
};
