import TicketConfig from "../../TicketConfig.js";
import Order from "../../db/Order.js";
import Item from "../../db/Item.js";

function getOrder(iOrderID) {
	return new Promise((resolve, reject) => {
		TicketConfig.db.order.getByID(iOrderID, (err, row) => {
			if(err) {
				reject(err);
			}
			let oOrder = row;

			TicketConfig.db.item.getAllForOrder(iOrderID, (err, rows) => {
				if(err) {
					reject(err);
				}

				oOrder.items = rows;
				resolve(oOrder);
			}, Item.COL_NAME);
		});
	});
}


function getAllItems(iOrderID) {
	return new Promise((resolve, reject) => {
		TicketConfig.db.item.getAllForOrder(iOrderID, (err, rows) => {
			if(err) {
				reject(err);
			}
			resolve(rows);
		}, Item.COL_NAME);
	})
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
	return new Promise((resolve, reject) => {
		let callback = (err, aOrders) => {
			if(err) {
				reject(err);
			}

			let aPromises = [];
			for(let oOrder of aOrders) {
				let oPromise = addItemsToOrder(oOrder);
				aPromises.push(oPromise);
			}

			Promise.allSettled(aPromises).then(aResults => {
				for(let oResult of aResults) {
					if(oResult.status === "rejected") {
						reject(oResult.reason);
						return;
					}
				}
				resolve(aOrders);
			}, reject);
		}

		TicketConfig.db.order.getAllByVenueStatus(iVenueID, aStatus, callback, sortOrder, limit);
	});
}


export default {
	getOrder,

	getAllItems,
	getAll,
};
