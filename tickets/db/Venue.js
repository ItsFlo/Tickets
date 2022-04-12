import { DbTable, COL_ID, addConstants } from "./DbTable.js";
import ItemCategory from './ItemCategory.js';
import Item from './Item.js';
import Order from './Order.js';

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


	getByName(name, caseSensitive=true) {
		let query = `SELECT * FROM "${TABLE}" WHERE "${COL_NAME}" = ?`;
		if(!caseSensitive) {
			query += " COLLATE NOCASE";
		}
		let stmt = this.db.prepare(query);
		return stmt.get(name);
	}
	getClosestToDate(date) {
		let query = `SELECT *,ABS(JULIANDAY("${COL_DATE}"||'T'||"${COL_TIME}") - JULIANDAY(?)) as datediff FROM "${TABLE}" ORDER BY datediff LIMIT 1`;
		let stmt = this.db.prepare(query);
		let venue = stmt.get(date.toISOString());
		if(!venue) {
			return null;
		}
		delete venue.datediff;
		return venue;
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


	getStats(venueId=null) {
		venueId = parseInt(venueId);
		let orderQuery = `SELECT * FROM
				"${Order.TABLE}"
			WHERE "${Order.COL_STATUS}"=?
		`;
		let params = [Order.STATUS_PICKEDUP];
		let query = `SELECT
				v.*,
				COUNT(o."${Order.COL_ID}") AS "orders",
				TOTAL(o."${Order.COL_PRICE}") AS "sum"
			FROM "${TABLE}" v
				LEFT OUTER JOIN (${orderQuery}) AS o ON o."${Order.COL_VENUE}"=v."${COL_ID}"
		`;
		if(!isNaN(venueId)) {
			query += ` WHERE v."${COL_ID}"=?`;
			params.push(venueId);
		}
		query += ` GROUP BY v."${COL_ID}"
			ORDER BY v."${COL_DATE}", v."${COL_TIME}"
		`;
		let stmt = this.db.prepare(query);
		return stmt.all(params);
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
