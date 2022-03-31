import sqlite3 from "sqlite3";
import Venue from "./Venue.js";
import ItemCategory from "./ItemCategory.js";
import Item from "./Item.js";
import Order from "./Order.js";
import OrderItem from "./OrderItem.js";


class DbConnection extends sqlite3.Database {
	mbDbReady = false;
	msFile;

	constructor(file, initCallback, createTables=true) {
		super(file, sqlite3.OPEN_CREATE | sqlite3.OPEN_READWRITE, (err) => {
			if(err) {
				console.error(err);
			}
			else {
				this.mbDbReady = true;
				if(createTables) {
					let initPromise = this.init();
					if(typeof initCallback === "function") {
						initPromise.then(initCallback, initCallback);
					}
				}
				else if(typeof initCallback === "function") {
					initCallback();
				}
			}
		});
		this.msFile = file;

		this.venue = new Venue.Venue(this);
		this.itemCategory = new ItemCategory.ItemCategory(this);
		this.item = new Item.Item(this);
		this.order = new Order.Order(this);
		this.orderItem = new OrderItem.OrderItem(this);
	}


	init() {
		if(!this.mbDbReady) {
			return;
		}

		return new Promise((resolve, reject) => {
			this.serialize(() => {
				let promises = [];
				this.run("PRAGMA foreign_keys = ON;");
				promises.push(this.venue.createTable());
				promises.push(this.itemCategory.createTable());
				promises.push(this.item.createTable());
				promises.push(this.order.createTable());
				promises.push(this.orderItem.createTable());
				Promise.allSettled(promises).then(results => {
					for(let result of results) {
						if(result.status === "rejected") {
							reject(result.reason);
							return;
						}
						resolve();
					}
				}, reject);
			});
		});
	}




	close() {
		return new Promise((resolve, reject) => {
			super.close((err) => {
				if(err) {
					console.error(err);
					reject(err);
				}
				else {
					this.mbDbReady = false;
					resolve();
				}
			});
		});
	}



	startTransaction(immediate=false) {
		return new Promise((resolve, reject) => {
			let db = new TransactionDbConnection(this.msFile, err => {
				if(err) {
					reject(err);
				}
				else {
					resolve(db);
				}
			}, immediate);
		});
	}
}


class TransactionDbConnection extends DbConnection {
	constructor(file, initCallback, immediate=false) {
		super(file, err => {
			if(err) {
				initCallback(err);
				return;
			}

			this.serialize();
			let query = immediate? "BEGIN IMMEDIATE TRANSACTION" : "BEGIN TRANSACTION";
			this.run(query, err => {
				if(err) {
					initCallback(err);
				}
				else {
					initCallback();
				}
			});
		}, false);
	}

	commit(closeConnection=true) {
		return new Promise((resolve, reject) => {
			this.run("COMMIT TRANSACTION", err => {
				if(err) {
					if(closeConnection) {
						this.close().catch(() => {}).finally(() => reject(err));
					}
					else {
						reject(err);
					}
				}
				else {
					console.log("close connection:", closeConnection);
					if(closeConnection) {
						this.close().catch(() => {}).then(resolve, reject);
					}
					else {
						resolve();
					}
				}
			});
		});
	}
	rollback(closeConnection=true) {
		return new Promise((resolve, reject) => {
			this.run("ROLLBACK TRANSACTION", err => {
				if(err) {
					if(closeConnection) {
						this.close().finally(() => reject(err));
					}
					else {
						reject(err);
					}
				}
				else {
					if(closeConnection) {
						this.close().then(resolve, reject);
					}
					else {
						resolve();
					}
				}
			});
		});
	}
};

export default DbConnection;
