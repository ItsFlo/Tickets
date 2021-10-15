import Order from "./Order.js";
import Item from "./Item.js";

const TABLE = "orderItem";

const COL_ID = "id";
const COL_ORDER = "order";
const COL_ITEM = "item";
const COL_COUNT = "count";
const COL_STATUS = "status";
const COLUMNS = [
	COL_ID,
	COL_ORDER,
	COL_ITEM,
	COL_COUNT,
	COL_STATUS,
];


class OrderItem {
	moDb;

	constructor(oDb) {
		this.moDb = oDb;
	}

	createTable(callback) {
		let sQuery = `CREATE TABLE IF NOT EXISTS "${TABLE}" (
			"${COL_ID}" INTEGER PRIMARY KEY,
			"${COL_ORDER}" INTEGER NOT NULL,
			"${COL_ITEM}" INTEGER NOT NULL,
			"${COL_COUNT}" INTEGER,
			"${COL_STATUS}" TEXT,

			UNIQUE("${COL_ORDER}", "${COL_ITEM}"),
			FOREIGN KEY("${COL_ORDER}") REFERENCES "${Order.TABLE}"("${Order.COL_ID}") ON DELETE CASCADE,
			FOREIGN KEY("${COL_ITEM}") REFERENCES "${Item.TABLE}"("${Item.COL_ID}") ON DELETE CASCADE
		)`;
		this.moDb.run(sQuery, callback);
		return this;
	}


	getByID(id, callback) {
		if(typeof callback !== "function") {
			return this;
		}
		let sQuery = `SELECT * FROM "${TABLE}" WHERE "${COL_ID}" = ?`;
		this.moDb.get(sQuery, [id], callback);
		return this;
	}
	get(order, item, callback) {
		if(typeof callback !== "function") {
			return this;
		}
		let sQuery = `SELECT * FROM "${TABLE}" WHERE "${COL_ORDER}" = ? AND "${COL_ITEM}" = ?`;
		this.moDb.get(sQuery, [order, item], callback);
		return this;
	}
	getAll(callback, orderCol) {
		if(typeof callback !== "function") {
			return this;
		}
		let sQuery = `SELECT * FROM "${TABLE}"`;
		if(orderCol && COLUMNS.includes(orderCol)) {
			sQuery += " ORDER BY ?";
		}
		this.moDb.get(sQuery, [orderCol], callback);
		return this;
	}
	getAllByOrder(order, callback, orderCol) {
		if(typeof callback !== "function") {
			return this;
		}
		let sQuery = `SELECT * FROM "${TABLE}" WHERE "${COL_ORDER}" = ? ORDER BY ?`;
		if(!orderCol || !COLUMNS.includes(orderCol)) {
			orderCol = COL_ITEM;
		}
		this.moDb.get(sQuery, [order, orderCol], callback);
		return this;
	}
	getAllByStatus(order, status, callback, orderCol) {
		if(typeof callback !== "function") {
			return this;
		}
		let sQuery = `SELECT * FROM "${TABLE}" WHERE "${COL_ORDER}" = ? AND "${COL_STATUS}" = ? ORDER BY ?`;
		if(!orderCol || !COLUMNS.includes(orderCol)) {
			orderCol = COL_ITEM;
		}
		this.moDb.get(sQuery, [order, status, orderCol], callback);
		return this;
	}
	update(id, count, status, callback) {
		let sQuery = `UPDATE "${TABLE}" SET "${COL_COUNT}" = ?, "${COL_STATUS}" = ? WHERE "${COL_ID}" = ?`;
		this.moDb.run(sQuery, [count, status, id], (err) => {
			if(typeof callback === "function") {
				callback(err);
			}
		});
		return this;
	}
	updateByOrderItem(order, item, count, status, callback) {
		let sQuery = `UPDATE "${TABLE}" SET "${COL_COUNT}" = ?, "${COL_STATUS}" = ? WHERE "${COL_ORDER}" = ? AND "${COL_ITEM}" = ?`;
		this.moDb.run(sQuery, [count, status, order, item], (err) => {
			if(typeof callback === "function") {
				callback(err);
			}
		});
		return this;
	}
	create(order, item, count, status, callback) {
		let sQuery = `INSERT INTO "${TABLE}" ("${COL_ORDER}", "${COL_ITEM}", "${COL_COUNT}", "${COL_STATUS}") VALUES (?, ?, ?, ?)`;
		this.moDb.run(sQuery, [order, item, count, status], function(err) {
			if(typeof callback === "function") {
				callback(err, this? this.lastID : undefined);
			}
		});
		return this;
	}
	delete(id, callback) {
		if(typeof callback !== "function") {
			callback = undefined;
		}
		let sQuery = `DELETE FROM "${TABLE}" WHERE "${COL_ID}" = ?`;
		this.moDb.run(sQuery, [id], callback);
		return this;
	}
	deleteByOrderItem(order, item, callback) {
		if(typeof callback !== "function") {
			callback = undefined;
		}
		let sQuery = `DELETE FROM "${TABLE}" WHERE "${COL_ORDER}" = ? AND "${COL_ITEM}" = ?`;
		this.moDb.run(sQuery, [order, item], callback);
		return this;
	}
}


export default {
	TABLE,
	COL_ID,
	COL_ORDER,
	COL_ITEM,
	COL_COUNT,
	COL_STATUS,
	COLUMNS,
	OrderItem,
};
