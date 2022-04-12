import { DbTable, COL_ID, addConstants } from "./DbTable.js";
import Venue from "./Venue.js";

const TABLE = "VenueCss";

const COL_CSS = "css";
const COLUMNS = [
	COL_ID,
	COL_CSS,
];


class VenueCss extends DbTable {
	constructor(db) {
		super(db);
	}

	createTable() {
		let query = `CREATE TABLE IF NOT EXISTS "${TABLE}" (
			"${COL_ID}" INTEGER PRIMARY KEY,
			"${COL_CSS}" TEXT NOT NULL DEFAULT "",

			FOREIGN KEY("${COL_ID}") REFERENCES "${Venue.TABLE}"("${Venue.COL_ID}") ON DELETE CASCADE
		)`;
		let stmt = this.db.prepare(query);
		stmt.run();
	}


	create(venueId, css) {
		let query = `INSERT INTO "${TABLE}" (
				"${COL_ID}",
				"${COL_CSS}"
			)
			VALUES (?,?)
		`;
		let stmt = this.db.prepare(query);
		let result = stmt.run(venueId, css);
		return result.lastInsertRowid;
	}
}


addConstants(VenueCss, TABLE, COLUMNS);

export default {
	TABLE,
	COL_ID,
	COL_CSS,
	COLUMNS,
	VenueCss,
};
