import HttpDispatcher from "../../../modules/HttpDispatcher.js";
import TicketConfig from "../../TicketConfig.js";
import Events from "../../Events.js";
import Order from "../../db/Order.js";
import Item from "../../db/Item.js";

class OrderPutDispatcher extends HttpDispatcher {
	request(sPath, request, response, oPost) {
		if(sPath) {
			response.writeHead(404);
			response.end();
			return;
		}
		let iVenueID = parseInt(oPost.venue);
		if(isNaN(iVenueID)) {
			response.writeHead(400);
			response.end("No venue provided");
			return;
		}
		let aItems = [];
		if(Array.isArray(oPost.items)) {
			for(let oItem of oPost.items) {
				oItem.id = parseInt(oItem.id);
				if(isNaN(oItem.id)) {
					continue;
				}
				oItem.count = parseInt(oItem.count);
				if(isNaN(oItem.count) || oItem.count < 1) {
					continue;
				}
				aItems.push(oItem);
			}
		}
		if(!aItems.length) {
			response.writeHead(400);
			response.end("No items provided");
			return;
		}

		TicketConfig.db.startTransaction();
		TicketConfig.db.order.create(iVenueID, null, "OPEN", (err, lastID) => {
			if(err) {
				response.writeHead(500);
				response.end(err.message);
				TicketConfig.db.rollbackTransaction();
			}
			else {
				let iOrderID = lastID;
				this.createOrderItems(response, iOrderID, aItems);
			}
		})
	}



	createOrderItems(response, iOrderID, aItems) {
		let aPromises = [];
		for(let oItem of aItems) {
			let oPromise = new Promise((resolve, reject) => {
				TicketConfig.db.orderItem.create(iOrderID, oItem.id, oItem.count, "OPEN", (err, lastID) => {
					if(err) {
						reject(err);
					}
					else {
						resolve(lastID);
					}
				});
			});
			aPromises.push(oPromise);
		}

		Promise.allSettled(aPromises).then(aResults => {
			for(let oResult of aResults) {
				if(oResult.status === "rejected") {
					response.writeHead(500);
					response.end(err.message);
					TicketConfig.db.rollbackTransaction();
					return;
				}
			}

			TicketConfig.db.order.recalculatePrice(iOrderID, err => {
				if(err) {
					response.writeHead(500);
					response.end(err.message);
					TicketConfig.db.rollbackTransaction();
					return;
				}

				TicketConfig.db.commitTransaction();
				TicketConfig.db.order.getByID(iOrderID, (err, row) => {
					if(err) {
						response.writeHead(500);
						response.end(err.message);
						return;
					}

					response.writeHead(200);
					response.end(JSON.stringify(row));
				});

				this.sendCreateEvent(iOrderID);
			});
		});
	}


	sendCreateEvent(iOrderID) {
		TicketConfig.db.order.getByID(iOrderID, (err, row) => {
			if(err) {
				return;
			}
			let oEventData = row;

			TicketConfig.db.item.getAllForOrder(iOrderID, (err, rows) => {
				if(err) {
					return;
				}

				oEventData.items = rows;
				Events.sendEvent(Order.TABLE, "create", JSON.stringify(oEventData));
			}, Item.COL_NAME);
		})
	}
};

export default OrderPutDispatcher;
