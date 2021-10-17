import { DbTable, COL_ID, addConstants } from "./DbTable.js";
import Venue from "./Venue.js";

const TABLE = "itemCategory";

const COL_VENUE = "venue";
const COL_NAME = "name";
const COLUMNS = [
	COL_ID,
	COL_VENUE,
	COL_NAME,
];


class ItemCategory extends DbTable {
	constructor(oDb) {
		super(oDb);
	}

	createTable(callback) {
		let sQuery = `CREATE TABLE IF NOT EXISTS "${TABLE}" (
			"${COL_ID}" INTEGER PRIMARY KEY,
			"${COL_VENUE}" INTEGER NOT NULL,
			"${COL_NAME}" TEXT NOT NULL,

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
		if(!sortOrder) {
			sortOrder = COL_NAME;
		}
		return this.getAllWhere(sWhere, [venue], callback, sortOrder, limit);
	}

	create(venue, name, callback) {
		return super.create({
			[COL_VENUE]: venue,
			[COL_NAME]: name,
		}, callback);
	}
}


addConstants(ItemCategory, TABLE, COLUMNS);

export default {
	TABLE,
	COL_ID,
	COL_VENUE,
	COL_NAME,
	COLUMNS,
	ItemCategory,
};
