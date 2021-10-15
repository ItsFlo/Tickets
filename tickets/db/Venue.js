import { DbTable, COL_ID, addConstants } from "./DbTable.js";

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
		this.moDb.run(sQuery, callback);
		return this;
	}


	getByName(name, callback) {
		if(typeof callback !== "function") {
			return this;
		}
		let sQuery = `SELECT * FROM "${TABLE}" WHERE "${COL_NAME}" = ?`;
		this.moDb.get(sQuery, [name], callback);
		return this;
	}

	getAllByDate(date, callback, sortOrder, limit) {
		let sWhere = `"${COL_DATE}" = ?`;
		return this.getAllWhere(sWhere, [date], callback, sortOrder, limit);
	}

	create(name, date, time, callback) {
		return super.create({
			[COL_NAME]: name,
			[COL_DATE]: date,
			[COL_TIME]: time,
		}, callback);
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
