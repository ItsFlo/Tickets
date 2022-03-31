import TicketConfig from "../../TicketConfig.js";
import Order from "../../db/Order.js";
import Item from "../../db/Item.js";

function getOrder(iOrderID) {
	return TicketConfig.db.order.getByID(iOrderID).then(order => {
		if(!order) {
			throw new Error("Not Found");
		}

		return TicketConfig.db.item.getAllForOrder(iOrderID, Item.COL_NAME).then(rows => {
			order.items = rows;
			return order;
		});
	});
}


function getAllItems(iOrderID) {
	return TicketConfig.db.item.getAllForOrder(iOrderID, Item.COL_NAME);
}
function addItemsToOrder(oOrder) {
	return getAllItems(oOrder.id).then(aItems => {
		oOrder.items = aItems;
		return oOrder;
	});
}



function getAll(iVenueID=null, aStatus=null, sortOrder=null, limit=null) {
	if(!sortOrder) {
		sortOrder = Order.COL_ORDER_TIMESTAMP;
	}
	return TicketConfig.db.order.getAllByVenueStatus(iVenueID, aStatus, sortOrder, limit).then(orders => {
		let promises = [];
		for(let order of orders) {
			let promise = addItemsToOrder(order);
			promises.push(promise);
		}

		return Promise.allSettled(promises).then(results => {
			for(let result of results) {
				if(result.status === "rejected") {
					throw result.reason;
				}
			}
			return orders;
		});
	});
}


export default {
	getOrder,

	getAllItems,
	getAll,
};
