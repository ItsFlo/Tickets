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
	constructor(db) {
		super(db);
	}

	createTable() {
		let query = `CREATE TABLE IF NOT EXISTS "${TABLE}" (
			"${COL_ID}" INTEGER PRIMARY KEY,
			"${COL_VENUE}" INTEGER NOT NULL,
			"${COL_NAME}" TEXT NOT NULL,

			UNIQUE("${COL_VENUE}", "${COL_NAME}"),
			FOREIGN KEY("${COL_VENUE}") REFERENCES "${Venue.TABLE}"("${Venue.COL_ID}") ON DELETE CASCADE
		)`;
		let stmt = this.db.prepare(query);
		stmt.run();
	}


	getByName(venue, name) {
		let query = `SELECT * FROM "${TABLE}" WHERE "${COL_VENUE}" = ? and "${COL_NAME}" = ?`;
		let stmt = this.db.prepare(query);
		return stmt.get(venue, name);
	}

	getAllByVenue(venue, sortOrder, limit) {
		let where = `"${COL_VENUE}" = ?`;
		if(!sortOrder) {
			sortOrder = COL_NAME;
		}
		return this.getAllWhere(where, [venue], sortOrder, limit);
	}

	create(venue, name) {
		return super.create({
			[COL_VENUE]: venue,
			[COL_NAME]: name,
		});
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
