import { DbTable, COL_ID, addConstants } from "./DbTable.js";
import ItemCategory from "./ItemCategory.js";
import OrderItem from "./OrderItem.js";

const TABLE = "item";

const COL_ITEM_CATEGORY = "itemCategory";
const COL_NAME = "name";
const COL_PRICE = "price";
const COLUMNS = [
	COL_ID,
	COL_ITEM_CATEGORY,
	COL_NAME,
	COL_PRICE,
];


class Item extends DbTable {
	constructor(db) {
		super(db);
	}

	createTable() {
		let query = `CREATE TABLE IF NOT EXISTS "${TABLE}" (
			"${COL_ID}" INTEGER PRIMARY KEY,
			"${COL_ITEM_CATEGORY}" INTEGER NOT NULL,
			"${COL_NAME}" TEXT,
			"${COL_PRICE}" REAL,

			UNIQUE("${COL_ITEM_CATEGORY}", "${COL_NAME}"),
			FOREIGN KEY("${COL_ITEM_CATEGORY}") REFERENCES "${ItemCategory.TABLE}"("${ItemCategory.COL_ID}") ON DELETE CASCADE
		)`;
		let stmt = this.db.prepare(query);
		stmt.run();
	}


	getByName(itemCategory, name) {
		let query = `SELECT * FROM "${TABLE}" WHERE "${COL_ITEM_CATEGORY}" = ? and "${COL_NAME}" = ?`;
		let stmt = this.db.prepare(query);
		return stmt.get(itemCategory, name);
	}

	getAllByItemCategory(itemCategory, sortOrder, limit) {
		let where = `"${COL_ITEM_CATEGORY}" = ?`;
		if(!sortOrder) {
			sortOrder = COL_NAME;
		}
		return this.getAllWhere(where, [itemCategory], sortOrder, limit);
	}

	getAllForOrder(orderID, sortOrder, limit) {
		let query = `SELECT it.*, oi."${OrderItem.COL_COUNT}" FROM "${TABLE}" it INNER JOIN "${OrderItem.TABLE}" oi ON it."${COL_ID}" = oi."${OrderItem.COL_ITEM}"`
					+ ` WHERE oi."${OrderItem.COL_ORDER}" = ?`;
		query += this.getOrderClause(sortOrder);
		query += this.getLimitClause(limit);

		let stmt = this.db.prepare(query);
		return stmt.all(orderID);
	}

	create(itemCategory, name, price) {
		return super.create({
			[COL_ITEM_CATEGORY]: itemCategory,
			[COL_NAME]: name,
			[COL_PRICE]: price,
		});
	}
}


addConstants(Item, TABLE, COLUMNS);

export default {
	TABLE,
	COL_ID,
	COL_ITEM_CATEGORY,
	COL_NAME,
	COL_PRICE,
	COLUMNS,
	Item,
};
