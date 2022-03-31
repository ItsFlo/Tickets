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
	constructor(oDb) {
		super(oDb);
	}

	createTable(callback) {
		let sQuery = `CREATE TABLE IF NOT EXISTS "${TABLE}" (
			"${COL_ID}" INTEGER PRIMARY KEY,
			"${COL_NAME}" TEXT UNIQUE,
			"${COL_DATE}" TEXT,
			"${COL_TIME}" TEXT
		)`;
		return new Promise((resolve, reject) => {
			this.moDb.run(sQuery, err => {
				if(err) {
					reject(err);
				}
				else {
					resolve();
				}
			});
		});
	}


	getByName(name) {
		let sQuery = `SELECT * FROM "${TABLE}" WHERE "${COL_NAME}" = ?`;
		return new Promise((resolve, reject) => {
			this.moDb.get(sQuery, [name], (err, rows) => {
				if(err) {
					reject(err);
				}
				else if(rows.length) {
					resolve(rows[0]);
				}
				else {
					resolve(null);
				}
			});
		});
	}

	getAllWithItemCount(sortOrder, limit) {
		let sGroupColumns = 'v."' + COLUMNS.join('", v."') + '"';
		let sQuery = `SELECT v.*, COUNT(DISTINCT it."${Item.COL_ID}") as "itemCount"
			FROM "${TABLE}" v
				LEFT OUTER JOIN
				"${ItemCategory.TABLE}" ic ON v."${COL_ID}" = ic."${ItemCategory.COL_VENUE}"
				LEFT OUTER JOIN
				"${Item.TABLE}" it ON ic."${ItemCategory.COL_ID}" = it."${Item.COL_ITEM_CATEGORY}"
			GROUP BY ${sGroupColumns}`;
		sQuery += this.getOrderClause(sortOrder);
		sQuery += this.getLimitClause(limit);
		return new Promise((resolve, reject) => {
			this.moDb.all(sQuery, [], (err, rows) => {
				if(err) {
					reject(err);
				}
				else {
					resolve(rows);
				}
			});
		});
	}
	getAllByDate(date, sortOrder, limit) {
		let sWhere = `"${COL_DATE}" = ?`;
		return this.getAllWhere(sWhere, [date], sortOrder, limit);
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
