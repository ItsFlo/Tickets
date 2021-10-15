import { DbTable, COL_ID, addConstants } from "./DbTable.js";
import Venue from "./Venue.js";

const TABLE = "order";

const COL_VENUE = "venue";
const COL_ORDER_NUMBER = "orderNumber";
const COL_PRICE = "price";
const COL_STATUS = "status";
const COL_ORDER_TIMESTAMP = "orderTimestamp";
const COL_DONE_TIMESTAMP = "doneTimestamp";
const COL_PICKUP_TIMESTAMP = "pickupTimestamp";
const COLUMNS = [
	COL_ID,
	COL_VENUE,
	COL_ORDER_NUMBER,
	COL_PRICE,
	COL_STATUS,
	COL_ORDER_TIMESTAMP,
	COL_DONE_TIMESTAMP,
	COL_PICKUP_TIMESTAMP,
];


class Order extends DbTable {
	constructor(oDb) {
		super(oDb);
	}

	createTable(callback) {
		let sQuery = `CREATE TABLE IF NOT EXISTS "${TABLE}" (
			"${COL_ID}" INTEGER PRIMARY KEY,
			"${COL_VENUE}" INTEGER NOT NULL,
			"${COL_ORDER_NUMBER}" INTEGER,
			"${COL_PRICE}" REAL,
			"${COL_STATUS}" TEXT,
			"${COL_ORDER_TIMESTAMP}" TEXT,
			"${COL_DONE_TIMESTAMP}" TEXT,
			"${COL_PICKUP_TIMESTAMP}" TEXT,

			UNIQUE("${COL_VENUE}", "${COL_ORDER_NUMBER}"),
			FOREIGN KEY("${COL_VENUE}") REFERENCES "${Venue.TABLE}"("${Venue.COL_ID}") ON DELETE CASCADE
		)`;
		this.moDb.run(sQuery, callback);
		return this;
	}


	getByOrderNumber(venue, orderNumber, callback) {
		if(typeof callback !== "function") {
			return this;
		}
		let sQuery = `SELECT * FROM "${TABLE}" WHERE "${COL_VENUE}" = ? AND "${COL_ORDER_NUMBER}" = ?`;
		this.moDb.get(sQuery, [venue, orderNumber], callback);
		return this;
	}
	getByName(venue, name, callback) {
		if(typeof callback !== "function") {
			return this;
		}
		let sQuery = `SELECT * FROM "${TABLE}" WHERE "${COL_VENUE}" = ? AND "${COL_NAME}" = ?`;
		this.moDb.get(sQuery, [venue, name], callback);
		return this;
	}

	getAllByVenue(venue, callback, order, limit) {
		let sWhere = `"${COL_VENUE}" = ?`;
		return this.getAllWhere(sWhere, [venue], callback, order, limit);
	}
	getAllByStatus(venue, status, callback, order, limit) {
		let sWhere = `"${COL_VENUE}" = ? AND "${COL_STATUS}" = ?`;
		return this.getAllWhere(sWhere, [venue, status], callback, order, limit);
	}

	updateByOrderNumber(venue, orderNumber, updates, callback) {
		let sWhere = `"${COL_VENUE}" = ? AND "${COL_ORDER_NUMBER}" = ?`;
		return this.updateWhere(sWhere, [venue, orderNumber], updates, callback);
	}

	create(venue, price, status, callback) {
		let sSubQuery = `SELECT IFNULL(MAX("${COL_ORDER_NUMBER}"), 0) FROM "${TABLE}" WHERE "${COL_VENUE}" = $venueID LIMIT 1`;
		let sQuery = `INSERT INTO "${TABLE}" ("${COL_VENUE}", "${COL_ORDER_NUMBER}", "${COL_PRICE}", "${COL_STATUS}") VALUES ($venueID, (${sSubQuery})+1, $price, $status)`;
		let oParams = {
			$venueID: venue,
			$price: price,
			$status: status,
		};
		this.moDb.run(sQuery, oParams, function(err) {
			if(typeof callback === "function") {
				callback(err, this? this.lastID : undefined);
			}
		});
		return this;
	}
	deleteByOrderNumber(venue, orderNumber, callback) {
		if(typeof callback !== "function") {
			callback = undefined;
		}
		let sQuery = `DELETE FROM "${TABLE}" WHERE "${COL_VENUE}" = ? AND "${COL_ORDER_NUMBER}" = ?`;
		this.moDb.run(sQuery, [venue, orderNumber], callback);
		return this;
	}
}


addConstants(Order, TABLE, COLUMNS);

export default {
	TABLE,
	COL_ID,
	COL_VENUE,
	COL_ORDER_NUMBER,
	COL_PRICE,
	COL_STATUS,
	COL_ORDER_TIMESTAMP,
	COL_DONE_TIMESTAMP,
	COL_PICKUP_TIMESTAMP,
	COLUMNS,
	Order,
};
