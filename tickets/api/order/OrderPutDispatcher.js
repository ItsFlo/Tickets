import HttpDispatcher, { sendStatus } from "../../../modules/HttpDispatcher.js";
import TicketConfig from "../../TicketConfig.js";
import Events from "../../Events.js";
import Order from "../../db/Order.js";
import OrderGetter from "./OrderGetter.js";

class OrderPutDispatcher extends HttpDispatcher {
	request(sPath, request, response, oPost) {
		if(sPath) {
			sendStatus(response, 404);
			return;
		}
		let iVenueID = parseInt(oPost.venue);
		if(isNaN(iVenueID)) {
			sendStatus(response, 400, "No venue provided");
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
			sendStatus(response, 400, "No items provided");
			return;
		}

		TicketConfig.db.startTransaction(true).then(transactionDb => {
			transactionDb.order.create(iVenueID, null, Order.STATUS_OPEN).then(lastID => {
				let iOrderID = lastID;
				this.createOrderItems(transactionDb, response, iOrderID, aItems);
			}, err => {
				sendStatus(response, 500, err.message);
				transactionDb.rollback();
			});
		}, err => {
			sendStatus(response, 500, err.message);
		});
	}



	createOrderItems(transactionDb, response, iOrderID, aItems) {
		let aPromises = [];
		for(let oItem of aItems) {
			let oPromise = transactionDb.orderItem.create(iOrderID, oItem.id, oItem.count, Order.STATUS_OPEN);
			aPromises.push(oPromise);
		}

		Promise.allSettled(aPromises).then(aResults => {
			for(let oResult of aResults) {
				if(oResult.status === "rejected") {
					sendStatus(response, 500, oResult.reason.message);
					transactionDb.rollback();
					return;
				}
			}

			transactionDb.order.recalculatePrice(iOrderID).then(changes => {
				transactionDb.commit(false).then(() => {
					transactionDb.order.getByID(iOrderID).then(row => {
						if(!row) {
							sendStatus(response, 500, "Couldn´t fetch new order");
							transactionDb.close().catch(err => {});
							return;
						}
						response.writeHead(201);
						response.end(JSON.stringify(row));
					}, err => {
						sendStatus(response, 500, err.message);
					}).finally(() => {
						transactionDb.close();
					});
					this.sendCreateEvent(iOrderID);
				}, err => {
					sendStatus(response, 500, err.message);
					transactionDb.rollback().catch(err => {});
				});

			}, err => {
				sendStatus(response, 500, err.message);
				transactionDb.rollback().catch(err => {});
			});
		});
	}


	sendCreateEvent(iOrderID) {
		OrderGetter.getOrder(iOrderID).then(oOrder => {
			Events.sendEvent(Order.TABLE, "create", oOrder);
		}, err => {});
	}
};

export default OrderPutDispatcher;
