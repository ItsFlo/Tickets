import Database from "better-sqlite3";
import Venue from "./Venue.js";
import VenueCss from "./VenueCss.js";
import ItemCategory from "./ItemCategory.js";
import Item from "./Item.js";
import Order from "./Order.js";
import OrderItem from "./OrderItem.js";


class DbConnection extends Database {
	file;

	constructor(file, createTables=true) {
		super(file);
		this.file = file;

		let stmt = this.prepare("PRAGMA foreign_keys = ON;");
		stmt.run();

		this.venue = new Venue.Venue(this);
		this.venueCss = new VenueCss.VenueCss(this);
		this.itemCategory = new ItemCategory.ItemCategory(this);
		this.item = new Item.Item(this);
		this.order = new Order.Order(this);
		this.orderItem = new OrderItem.OrderItem(this);
		if(createTables) {
			this.init();
		}
	}


	init() {
		if(!this.open) {
			return;
		}

		this.venue.createTable();
		this.venueCss.createTable();
		this.itemCategory.createTable();
		this.item.createTable();
		this.order.createTable();
		this.orderItem.createTable();
	}
}

export default DbConnection;
