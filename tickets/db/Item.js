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
	constructor(oDb) {
		super(oDb);
	}

	createTable(callback) {
		let sQuery = `CREATE TABLE IF NOT EXISTS "${TABLE}" (
			"${COL_ID}" INTEGER PRIMARY KEY,
			"${COL_ITEM_CATEGORY}" INTEGER NOT NULL,
			"${COL_NAME}" TEXT,
			"${COL_PRICE}" REAL,

			UNIQUE("${COL_ITEM_CATEGORY}", "${COL_NAME}"),
			FOREIGN KEY("${COL_ITEM_CATEGORY}") REFERENCES "${ItemCategory.TABLE}"("${ItemCategory.COL_ID}") ON DELETE CASCADE
		)`;
		this.moDb.run(sQuery, callback);
		return this;
	}


	getByName(itemCategory, name, callback) {
		if(typeof callback !== "function") {
			return this;
		}
		let sQuery = `SELECT * FROM "${TABLE}" WHERE "${COL_ITEM_CATEGORY}" = ? and "${COL_NAME}" = ?`;
		this.moDb.get(sQuery, [itemCategory, name], callback);
		return this;
	}

	getAllByItemCategory(itemCategory, callback, sortOrder, limit) {
		let sWhere = `"${COL_ITEM_CATEGORY}" = ?`;
		if(!sortOrder) {
			sortOrder = COL_NAME;
		}
		return this.getAllWhere(sWhere, [itemCategory], callback, sortOrder, limit);
	}

	getAllForOrder(orderID, callback, sortOrder, limit) {
		let sQuery = `SELECT it.* FROM "${TABLE}" it INNER JOIN "${OrderItem.TABLE}" oi ON it."${COL_ID}" = oi."${OrderItem.COL_ITEM}"`
					+ ` WHERE oi."${OrderItem.COL_ORDER}" = ?`;
		sQuery += this.getOrderClause(sortOrder);
		sQuery += this.getLimitClause(limit);
		this.moDb.all(sQuery, [orderID], callback);
	}

	create(itemCategory, name, price, callback) {
		return super.create({
			[COL_ITEM_CATEGORY]: itemCategory,
			[COL_NAME]: name,
			[COL_PRICE]: price,
		}, callback);
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
