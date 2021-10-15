import { DbTable, COL_ID, addConstants } from "./DbTable.js";
import Order from "./Order.js";
import Item from "./Item.js";

const TABLE = "orderItem";

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


class OrderItem extends DbTable {
	constructor(oDb) {
		super(oDb);
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


	get(order, item, callback) {
		if(typeof callback !== "function") {
			return this;
		}
		let sQuery = `SELECT * FROM "${TABLE}" WHERE "${COL_ORDER}" = ? AND "${COL_ITEM}" = ?`;
		this.moDb.get(sQuery, [order, item], callback);
		return this;
	}

	getAllByOrder(order, callback, order, limit) {
		let sWhere = `"${COL_ORDER}" = ?`;
		return this.getAllWhere(sWhere, [order], callback, order, limit);
	}
	getAllByStatus(order, status, callback, order, limit) {
		let sWhere = `"${COL_ORDER}" = ? AND "${COL_STATUS}" = ?`;
		return this.getAllWhere(sWhere, [order, status], callback, order, limit);
	}

	updateByOrderItem(order, item, updates, callback) {
		let sWhere = `"${COL_ORDER}" = ? AND "${COL_ITEM}" = ?`;
		return this.updateWhere(sWhere, [order, item], updates, callback);
	}

	create(order, item, count, status, callback) {
		return super.create({
			[COL_ORDER]: order,
			[COL_ITEM]: item,
			[COL_COUNT]: count,
			[COL_STATUS]: status,
		}, callback);
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


addConstants(OrderItem, TABLE, COLUMNS);

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
