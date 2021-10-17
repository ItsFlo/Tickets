import sqlite3 from "sqlite3";
import Venue from "./Venue.js";
import ItemCategory from "./ItemCategory.js";
import Item from "./Item.js";
import Order from "./Order.js";
import OrderItem from "./OrderItem.js";


class DbConnection extends sqlite3.Database {
	mbDbReady = false;

	constructor(file, initCallback) {
		super(file, sqlite3.OPEN_CREATE | sqlite3.OPEN_READWRITE, (err) => {
			if(err) {
				console.error(err);
			}
			else {
				this.mbDbReady = true;
				this.init(initCallback);
			}
		});

		this.venue = new Venue.Venue(this);
		this.itemCategory = new ItemCategory.ItemCategory(this);
		this.item = new Item.Item(this);
		this.order = new Order.Order(this);
		this.orderItem = new OrderItem.OrderItem(this);
	}


	init(initCallback) {
		if(!this.mbDbReady) {
			return;
		}

		this.serialize(() => {
			this.run("PRAGMA foreign_keys = ON;");
			this.venue.createTable();
			this.itemCategory.createTable();
			this.item.createTable();
			this.order.createTable();
			this.orderItem.createTable(initCallback);
		});
	}




	close() {
		super.close((err) => {
			if(err) {
				console.error(err);
			}
			else {
				this.mbDbReady = false;
			}
		});
	}
}

export default DbConnection;
