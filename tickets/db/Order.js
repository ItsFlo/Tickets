import { DbTable, COL_ID, addConstants } from "./DbTable.js";
import Venue from "./Venue.js";
import Item from "./Item.js";
import OrderItem from "./OrderItem.js";

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
const SELECT_LIST = `
	"${COL_ID}",
	"${COL_VENUE}",
	"${COL_ORDER_NUMBER}",
	"${COL_PRICE}",
	"${COL_STATUS}",
	(strftime('%s', "${COL_ORDER_TIMESTAMP}")-0) AS "${COL_ORDER_TIMESTAMP}",
	(strftime('%s', "${COL_DONE_TIMESTAMP}")-0) AS "${COL_DONE_TIMESTAMP}",
	(strftime('%s', "${COL_PICKUP_TIMESTAMP}")-0) AS "${COL_PICKUP_TIMESTAMP}"
`;	//strftime()-0 to convert to integer

const STATUS_OPEN = "OPEN";
const STATUS_PREPARED = "PREPARED";
const STATUS_PICKEDUP = "PICKEDUP";
const STATUS_CANCELED = "CANCELED";
const STATUS = [
	STATUS_OPEN,
	STATUS_PREPARED,
	STATUS_PICKEDUP,
	STATUS_CANCELED,
];


class Order extends DbTable {
	constructor(db) {
		super(db);
	}

	createTable() {
		let query = `CREATE TABLE IF NOT EXISTS "${TABLE}" (
			"${COL_ID}" INTEGER PRIMARY KEY,
			"${COL_VENUE}" INTEGER NOT NULL,
			"${COL_ORDER_NUMBER}" INTEGER,
			"${COL_PRICE}" REAL,
			"${COL_STATUS}" TEXT,
			"${COL_ORDER_TIMESTAMP}" TEXT DEFAULT CURRENT_TIMESTAMP,
			"${COL_DONE_TIMESTAMP}" TEXT,
			"${COL_PICKUP_TIMESTAMP}" TEXT,

			UNIQUE("${COL_VENUE}", "${COL_ORDER_NUMBER}"),
			FOREIGN KEY("${COL_VENUE}") REFERENCES "${Venue.TABLE}"("${Venue.COL_ID}") ON DELETE CASCADE
		)`;
		let stmt = this.db.prepare(query);
		stmt.run();
	}

	getOneWhere(where=null, whereValues=null, sortOrder=null) {
		let values = [];
		if(!Array.isArray(whereValues) && whereValues !== null) {
			whereValues = [whereValues];
		}
		let query = `SELECT ${SELECT_LIST} FROM "${this.constructor.TABLE}"`;

		//WHERE
		if(where) {
			query += " WHERE " + where;
			values = whereValues;
		}

		//ORDER BY
		query += this.getOrderClause(sortOrder);

		//LIMIT
		query += this.getLimitClause(1);

		let stmt = this.db.prepare(query);
		return stmt.get(values);
	}

	getAllWhere(where=null, whereValues=null, sortOrder=null, limit=null, offset=null) {
		let values = [];
		if(!Array.isArray(whereValues) && whereValues !== null) {
			whereValues = [whereValues];
		}
		let query = `SELECT ${SELECT_LIST} FROM "${this.constructor.TABLE}"`;

		//WHERE
		if(where) {
			query += " WHERE " + where;
			values = whereValues;
		}

		//ORDER BY
		query += this.getOrderClause(sortOrder);

		//LIMIT
		query += this.getLimitClause(limit, offset);

		let stmt = this.db.prepare(query);
		return stmt.all(values);
	}


	getByOrderNumber(venueId, orderNumber) {
		let query = `SELECT ${SELECT_LIST} FROM "${TABLE}" WHERE "${COL_VENUE}" = ? AND "${COL_ORDER_NUMBER}" = ?`;
		let stmt = this.db.prepare(query);
		return stmt.get(venueId, orderNumber);
	}

	getAllByVenue(venueId, sortOrder, limit) {
		let where = `"${COL_VENUE}" = ?`;
		return this.getAllWhere(where, [venueId], sortOrder, limit);
	}
	getAllByStatus(status, sortOrder, limit) {
		let where = `"${COL_STATUS}" = ?`;
		return this.getAllWhere(where, [status], sortOrder, limit);
	}
	getAllByVenueStatus(venueId, status, sortOrder, limit) {
		let values = [];
		let where = "";
		venueId = parseInt(venueId);
		if(!isNaN(venueId)) {
			where += `"${COL_VENUE}" = ?`;
			values.push(venueId);
		}
		if(typeof status === "string" && status) {
			if(where) {
				where += " AND ";
			}
			where += `"${COL_STATUS}" = ?`;
			values.push(status);
		}
		else if(Array.isArray(status)) {
			let statusWhere = "";
			for(let statusValue of status) {
				if(statusWhere) {
					statusWhere += " OR ";
				}
				statusWhere += `"${COL_STATUS}" = ?`;
				values.push(statusValue);
			}
			if(statusWhere) {
				where += ` AND (${statusWhere})`;
			}
		}

		return this.getAllWhere(where, values, sortOrder, limit);
	}

	updateByOrderNumber(venueId, orderNumber, updates) {
		let where = `"${COL_VENUE}" = ? AND "${COL_ORDER_NUMBER}" = ?`;
		return this.updateWhere(where, [venueId, orderNumber], updates);
	}

	updatePrepared(id) {
		let where = `"${COL_ID}" = ? AND "${COL_STATUS}" = ?`;
		let values = [
			id,
			STATUS_OPEN,
		];
		let updates = {
			[COL_STATUS]: STATUS_PREPARED,
			[COL_DONE_TIMESTAMP]: this.formatDate(new Date()),
		};
		return this.updateWhere(where, values, updates);
	}
	updatePickedUp(id) {
		let where = `"${COL_ID}" = ? AND "${COL_STATUS}" = ?`;
		let values = [
			id,
			STATUS_PREPARED,
		];
		let updates = {
			[COL_STATUS]: STATUS_PICKEDUP,
			[COL_PICKUP_TIMESTAMP]: this.formatDate(new Date()),
		};
		return this.updateWhere(where, values, updates);
	}
	cancel(id) {
		let where = `"${COL_ID}" = ? AND "${COL_STATUS}" IN (?, ?)`;
		let values = [
			id,
			STATUS_OPEN,
			STATUS_PREPARED,
		];
		let updates = {
			[COL_STATUS]: STATUS_CANCELED,
			[COL_PICKUP_TIMESTAMP]: this.formatDate(new Date()),
		};
		return this.updateWhere(where, values, updates);
	}

	formatDate(date) {
		let dateString = date.getFullYear() + "-";

		if(date.getMonth() < 9) {
			dateString += "0";
		}
		dateString += (date.getMonth()+1) + "-";

		if(date.getDate() < 10) {
			dateString += "0";
		}
		dateString += date.getDate();

		dateString += " ";

		dateString += date.getHours() + ":";
		if(date.getMinutes() < 9) {
			dateString += "0";
		}
		dateString += (date.getMinutes()) + ":";
		if(date.getSeconds() < 10) {
			dateString += "0";
		}
		dateString += date.getSeconds();

		return dateString;
	}



	recalculatePrice(id) {
		id = parseInt(id);
		if(isNaN(id)) {
			throw new Error("No id provided");
		}

		let subQuery = `SELECT SUM(it."${Item.COL_PRICE}" * oi."${OrderItem.COL_COUNT}") FROM "${OrderItem.TABLE}" oi INNER JOIN "${Item.TABLE}" it ON oi."${OrderItem.COL_ITEM}" = it."${Item.COL_ID}"`
					+ ` WHERE oi."${OrderItem.COL_ORDER}" = ?`;

		let query = `UPDATE "${TABLE}" SET "${COL_PRICE}" = (${subQuery}) WHERE "${COL_ID}" = ?`;
		let values = [id, id];

		let stmt = this.db.prepare(query);
		let result = stmt.run(values);
		return result.changes;
	}

	create(venue, price, status=STATUS_OPEN) {
		let subQuery = `SELECT IFNULL(MAX("${COL_ORDER_NUMBER}"), 0) FROM "${TABLE}" WHERE "${COL_VENUE}" = $venueID LIMIT 1`;
		let query = `INSERT INTO "${TABLE}" ("${COL_VENUE}", "${COL_ORDER_NUMBER}", "${COL_PRICE}", "${COL_STATUS}") VALUES ($venueID, (${subQuery})+1, $price, $status)`;
		let params = {
			venueID: venue,
			price: price,
			status: status,
		};

		let stmt = this.db.prepare(query);
		let result = stmt.run(params);
		return result.lastInsertRowid;
	}
	deleteByOrderNumber(venue, orderNumber) {
		let query = `DELETE FROM "${TABLE}" WHERE "${COL_VENUE}" = ? AND "${COL_ORDER_NUMBER}" = ?`;
		let stmt = this.db.prepare(query);
		let result = stmt.run(venue, orderNumber);
		return result.changes;
	}
	deleteAllFromVenue(venue) {
		let query = `DELETE FROM "${TABLE}" WHERE "${COL_VENUE}" = ?`;
		let stmt = this.db.prepare(query);
		let result = stmt.run(venue);
		return result.changes;
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

	STATUS_OPEN,
	STATUS_PREPARED,
	STATUS_PICKEDUP,
	STATUS_CANCELED,
	STATUS,
};
