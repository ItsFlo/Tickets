import { DbTable, COL_ID, addConstants } from "./DbTable.js";
import ItemCategory from './ItemCategory.js';
import Item from './Item.js';

const TABLE = "venue";

const COL_NAME = "name";
const COL_DATE = "date";
const COL_TIME = "time";
const COLUMNS = [
	COL_ID,
	COL_NAME,
	COL_DATE,
	COL_TIME,
];


class Venue extends DbTable {
	constructor(db) {
		super(db);
	}

	createTable() {
		let query = `CREATE TABLE IF NOT EXISTS "${TABLE}" (
			"${COL_ID}" INTEGER PRIMARY KEY,
			"${COL_NAME}" TEXT UNIQUE,
			"${COL_DATE}" TEXT,
			"${COL_TIME}" TEXT
		)`;
		let stmt = this.db.prepare(query);
		stmt.run();
	}


	getByName(name) {
		let query = `SELECT * FROM "${TABLE}" WHERE "${COL_NAME}" = ?`;
		let stmt = this.db.prepare(query);
		return stmt.get(name);
	}

	getAllWithItemCount(sortOrder, limit) {
		let groupColumns = 'v."' + COLUMNS.join('", v."') + '"';
		let query = `SELECT v.*, COUNT(DISTINCT it."${Item.COL_ID}") as "itemCount"
			FROM "${TABLE}" v
				LEFT OUTER JOIN
				"${ItemCategory.TABLE}" ic ON v."${COL_ID}" = ic."${ItemCategory.COL_VENUE}"
				LEFT OUTER JOIN
				"${Item.TABLE}" it ON ic."${ItemCategory.COL_ID}" = it."${Item.COL_ITEM_CATEGORY}"
			GROUP BY ${groupColumns}`;
		query += this.getOrderClause(sortOrder);
		query += this.getLimitClause(limit);

		let stmt = this.db.prepare(query);
		return stmt.all();
	}
	getAllByDate(date, sortOrder, limit) {
		let where = `"${COL_DATE}" = ?`;
		return this.getAllWhere(where, [date], sortOrder, limit);
	}

	create(name, date, time) {
		return super.create({
			[COL_NAME]: name,
			[COL_DATE]: date,
			[COL_TIME]: time,
		});
	}
}


addConstants(Venue, TABLE, COLUMNS);

export default {
	TABLE,
	COL_ID,
	COL_NAME,
	COL_DATE,
	COL_TIME,
	COLUMNS,
	Venue,
};
