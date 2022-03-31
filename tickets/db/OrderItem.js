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
	constructor(db) {
		super(db);
	}

	createTable() {
		let query = `CREATE TABLE IF NOT EXISTS "${TABLE}" (
			"${COL_ID}" INTEGER PRIMARY KEY,
			"${COL_ORDER}" INTEGER NOT NULL,
			"${COL_ITEM}" INTEGER NOT NULL,
			"${COL_COUNT}" INTEGER DEFAULT 1,
			"${COL_STATUS}" TEXT,

			UNIQUE("${COL_ORDER}", "${COL_ITEM}"),
			FOREIGN KEY("${COL_ORDER}") REFERENCES "${Order.TABLE}"("${Order.COL_ID}") ON DELETE CASCADE,
			FOREIGN KEY("${COL_ITEM}") REFERENCES "${Item.TABLE}"("${Item.COL_ID}") ON DELETE CASCADE
		)`;
		let stmt = this.db.prepare(query);
		stmt.run();
	}


	get(order, item) {
		let query = `SELECT * FROM "${TABLE}" WHERE "${COL_ORDER}" = ? AND "${COL_ITEM}" = ?`;
		let stmt = this.db.prepare(query);
		return stmt.get(order, item);
	}

	getAllByOrder(order, sortOrder, limit) {
		let where = `"${COL_ORDER}" = ?`;
		return this.getAllWhere(where, [order], sortOrder, limit);
	}
	getAllByStatus(order, status, sortOrder, limit) {
		let where = `"${COL_ORDER}" = ? AND "${COL_STATUS}" = ?`;
		return this.getAllWhere(where, [order, status], sortOrder, limit);
	}

	updateByOrderItem(order, item, updates) {
		let where = `"${COL_ORDER}" = ? AND "${COL_ITEM}" = ?`;
		return this.updateWhere(where, [order, item], updates);
	}

	create(order, item, count, status) {
		return super.create({
			[COL_ORDER]: order,
			[COL_ITEM]: item,
			[COL_COUNT]: count,
			[COL_STATUS]: status,
		});
	}
	deleteByOrderItem(order, item) {
		let query = `DELETE FROM "${TABLE}" WHERE "${COL_ORDER}" = ? AND "${COL_ITEM}" = ?`;
		let stmt = this.db.prepare(query);
		let result = stmt.run(order, item);
		return result.changes;
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
