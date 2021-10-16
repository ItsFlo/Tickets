import { DbTable, COL_ID, addConstants } from "./DbTable.js";
import Venue from "./Venue.js";

const TABLE = "item";

const COL_VENUE = "venue";
const COL_NAME = "name";
const COL_PRICE = "price";
const COLUMNS = [
	COL_ID,
	COL_VENUE,
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
			"${COL_VENUE}" INTEGER NOT NULL,
			"${COL_NAME}" TEXT,
			"${COL_PRICE}" REAL,

			UNIQUE("${COL_VENUE}", "${COL_NAME}"),
			FOREIGN KEY("${COL_VENUE}") REFERENCES "${Venue.TABLE}"("${Venue.COL_ID}") ON DELETE CASCADE
		)`;
		this.moDb.run(sQuery, callback);
		return this;
	}


	getByName(venue, name, callback) {
		if(typeof callback !== "function") {
			return this;
		}
		let sQuery = `SELECT * FROM "${TABLE}" WHERE "${COL_VENUE}" = ? and "${COL_NAME}" = ?`;
		this.moDb.get(sQuery, [venue, name], callback);
		return this;
	}

	getAllByVenue(venue, callback, sortOrder, limit) {
		let sWhere = `"${COL_VENUE}" = ?`;
		return this.getAllWhere(sWhere, [venue], callback, sortOrder, limit);
	}

	create(venue, name, price, callback) {
		return super.create({
			[COL_VENUE]: venue,
			[COL_NAME]: name,
			[COL_PRICE]: price,
		}, callback);
	}
}


addConstants(Item, TABLE, COLUMNS);

export default {
	TABLE,
	COL_ID,
	COL_VENUE,
	COL_NAME,
	COL_PRICE,
	COLUMNS,
	Item,
};
