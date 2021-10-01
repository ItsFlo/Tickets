const TABLE = "order";

const COL_ID = "id";
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


class Order {
	moDb;

	constructor(oDb) {
		this.moDb = oDb;
	}

	createTable(callback) {
		let sQuery = `CREATE TABLE IF NOT EXISTS "${TABLE}" ("${COL_ID}" INTEGER PRIMARY KEY, "${COL_VENUE}" INTEGER, "${COL_ORDER_NUMBER}" INTEGER, "${COL_PRICE}" REAL, "${COL_STATUS}" TEXT, "${COL_ORDER_TIMESTAMP}" TEXT, "${COL_DONE_TIMESTAMP}" TEXT, "${COL_PICKUP_TIMESTAMP}" TEXT, UNIQUE("${COL_VENUE}", "${COL_ORDER_NUMBER}"))`;
		this.moDb.run(sQuery, callback);
		return this;
	}


	getByID(id, callback) {
		if(typeof callback !== "function") {
			return this;
		}
		let sQuery = `SELECT * FROM "${TABLE}" WHERE "${COL_ID}" = ?`;
		this.moDb.get(sQuery, [id], callback);
		return this;
	}
	get(venue, orderNumber, callback) {
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
	getAll(callback, orderCol) {
		if(typeof callback !== "function") {
			return this;
		}
		let sQuery = `SELECT * FROM "${TABLE}"`;
		if(orderCol && COLUMNS.includes(orderCol)) {
			sQuery += " ORDER BY ?";
		}
		this.moDb.get(sQuery, [orderCol], callback);
		return this;
	}
	getAllByVenue(venue, callback, orderCol) {
		if(typeof callback !== "function") {
			return this;
		}
		let sQuery = `SELECT * FROM "${TABLE}" WHERE "${COL_VENUE}" = ? ORDER BY ?`;
		if(!orderCol || !COLUMNS.includes(orderCol)) {
			orderCol = COL_ORDER_NUMBER;
		}
		this.moDb.get(sQuery, [venue, orderCol], callback);
		return this;
	}
	getAllByStatus(venue, status, callback, orderCol) {
		if(typeof callback !== "function") {
			return this;
		}
		let sQuery = `SELECT * FROM "${TABLE}" WHERE "${COL_VENUE}" = ? AND "${COL_STATUS}" = ? ORDER BY ?`;
		if(!orderCol || !COLUMNS.includes(orderCol)) {
			orderCol = COL_ID;
		}
		this.moDb.get(sQuery, [venue, status, orderCol], callback);
		return this;
	}
	update(id, price, status, callback) {
		let sQuery = `UPDATE "${TABLE}" SET "${COL_PRICE}" = ?, "${COL_STATUS}" = ? WHERE "${COL_ID}" = ?`;
		this.moDb.run(sQuery, [price, status, id], (err) => {
			if(typeof callback === "function") {
				callback(err);
			}
		});
		return this;
	}
	updateByOrderNumber(venue, orderNumber, price, status, callback) {
		let sQuery = `UPDATE "${TABLE}" SET "${COL_PRICE}" = ?, "${COL_STATUS}" = ? WHERE "${COL_VENUE}" = ? AND "${COL_ORDER_NUMBER}" = ?`;
		this.moDb.run(sQuery, [price, status, venue, orderNumber], (err) => {
			if(typeof callback === "function") {
				callback(err);
			}
		});
		return this;
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
	delete(id, callback) {
		if(typeof callback !== "function") {
			callback = undefined;
		}
		let sQuery = `DELETE FROM "${TABLE}" WHERE "${COL_ID}" = ?`;
		this.moDb.run(sQuery, [id], callback);
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


export default {
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
