import { DbTable, COL_ID, addConstants } from "./DbTable.js";
import Item from "./Item.js";
import OrderItem from "./OrderItem.js";
import Order from "./Order.js";
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


	getStats(venueId=null) {
		venueId = parseInt(venueId);
		let orderQuery = `SELECT * FROM
				"${OrderItem.TABLE}" tmp_oi
				LEFT OUTER JOIN "${Order.TABLE}" o ON o."${Order.COL_ID}"=tmp_oi."${OrderItem.COL_ORDER}"
			WHERE o."${Order.COL_STATUS}"=?
		`;
		let params = [Order.STATUS_PICKEDUP];
		let query = `SELECT
				ic.*,
				TOTAL(oi."${OrderItem.COL_COUNT}") AS "count",
				CASE WHEN "count" == 0 THEN 0 ELSE TOTAL(i."${Item.COL_PRICE}" * oi."${OrderItem.COL_COUNT}") END AS "sum"
			FROM "${TABLE}" ic
				LEFT OUTER JOIN "${Item.TABLE}" i ON i."${Item.COL_ITEM_CATEGORY}"=ic."${COL_ID}"
				LEFT OUTER JOIN (${orderQuery}) AS oi ON oi."${OrderItem.COL_ITEM}"=i."${Item.COL_ID}"
		`;
		if(!isNaN(venueId)) {
			query += ` WHERE ic."${COL_VENUE}"=?`;
			params.push(venueId);
		}
		query += ` GROUP BY ic."${COL_ID}"
			ORDER BY ic."${COL_NAME}"
		`;
		let stmt = this.db.prepare(query);
		return stmt.all(params);
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
