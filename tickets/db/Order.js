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

const STATUS_OPEN = "OPEN";
const STATUS_PREPARED = "PREPARED";
const STATUS_PICKEDUP = "PICKEDUP";
const STATUS = [
	STATUS_OPEN,
	STATUS_PREPARED,
	STATUS_PICKEDUP,
];


class Order extends DbTable {
	constructor(oDb) {
		super(oDb);
	}

	createTable() {
		let sQuery = `CREATE TABLE IF NOT EXISTS "${TABLE}" (
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


	getByOrderNumber(venue, orderNumber) {
		let sQuery = `SELECT * FROM "${TABLE}" WHERE "${COL_VENUE}" = ? AND "${COL_ORDER_NUMBER}" = ?`;
		return new Promise((resolve, reject) => {
			this.moDb.get(sQuery, [venue, orderNumber], (err, rows) => {
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

	getAllByVenue(venue, sortOrder, limit) {
		let sWhere = `"${COL_VENUE}" = ?`;
		return this.getAllWhere(sWhere, [venue], sortOrder, limit);
	}
	getAllByStatus(status, sortOrder, limit) {
		let sWhere = `"${COL_STATUS}" = ?`;
		return this.getAllWhere(sWhere, [status], sortOrder, limit);
	}
	getAllByVenueStatus(venue, status, sortOrder, limit) {
		let aValues = [];
		let sWhere = "";
		venue = parseInt(venue);
		if(!isNaN(venue)) {
			sWhere += `"${COL_VENUE}" = ?`;
			aValues.push(venue);
		}
		if(typeof status === "string" && status) {
			if(sWhere) {
				sWhere += " AND ";
			}
			sWhere += `"${COL_STATUS}" = ?`;
			aValues.push(status);
		}
		else if(Array.isArray(status)) {
			let sStatusWhere = "";
			for(let sStatus of status) {
				if(sStatusWhere) {
					sStatusWhere += " OR ";
				}
				sStatusWhere += `"${COL_STATUS}" = ?`;
				aValues.push(sStatus);
			}
			if(sStatusWhere) {
				sWhere += ` AND (${sStatusWhere})`;
			}
		}

		return this.getAllWhere(sWhere, aValues, sortOrder, limit);
	}

	updateByOrderNumber(venue, orderNumber, updates) {
		let sWhere = `"${COL_VENUE}" = ? AND "${COL_ORDER_NUMBER}" = ?`;
		return this.updateWhere(sWhere, [venue, orderNumber], updates);
	}
	updatePrepared(iID) {
		let sWhere = `"${COL_ID}" = ? AND "${COL_STATUS}" = ?`;
		let aValues = [
			iID,
			STATUS_OPEN,
		];
		let oUpdates = {
			[COL_STATUS]: STATUS_PREPARED,
			[COL_DONE_TIMESTAMP]: this.formatDate(new Date()),
		};
		return this.updateWhere(sWhere, aValues, oUpdates);
	}
	updatePickedUp(iID) {
		let sWhere = `"${COL_ID}" = ? AND "${COL_STATUS}" = ?`;
		let aValues = [
			iID,
			STATUS_PREPARED,
		];
		let oUpdates = {
			[COL_STATUS]: STATUS_PICKEDUP,
			[COL_PICKUP_TIMESTAMP]: this.formatDate(new Date()),
		};
		return this.updateWhere(sWhere, aValues, oUpdates);
	}

	formatDate(date) {
		let sDateString = date.getFullYear() + "-";

		if(date.getMonth() < 9) {
			sDateString += "0";
		}
		sDateString += (date.getMonth()+1) + "-";

		if(date.getDate() < 10) {
			sDateString += "0";
		}
		sDateString += date.getDate();

		sDateString += " ";

		sDateString += date.getHours() + ":";
		if(date.getMinutes() < 9) {
			sDateString += "0";
		}
		sDateString += (date.getMinutes()) + ":";
		if(date.getSeconds() < 10) {
			sDateString += "0";
		}
		sDateString += date.getSeconds();

		return sDateString;
	}



	recalculatePrice(id) {
		id = parseInt(id);
		if(isNaN(id)) {
			return Promise.reject(new Error("No id provided"));
		}

		let sSubQuery = `SELECT SUM(it."${Item.COL_PRICE}" * oi."${OrderItem.COL_COUNT}") FROM "${OrderItem.TABLE}" oi INNER JOIN "${Item.TABLE}" it ON oi."${OrderItem.COL_ITEM}" = it."${Item.COL_ID}"`
					+ ` WHERE oi."${OrderItem.COL_ORDER}" = ?`;

		let sQuery = `UPDATE "${TABLE}" SET "${COL_PRICE}" = (${sSubQuery}) WHERE "${COL_ID}" = ?`;
		let aValues = [id, id];

		return new Promise((resolve, reject) => {
			this.moDb.run(sQuery, aValues, function(err) {
				if(err) {
					reject(err);
				}
				else {
					resolve(this.changes);
				}
			});
		});
	}

	create(venue, price, status) {
		let sSubQuery = `SELECT IFNULL(MAX("${COL_ORDER_NUMBER}"), 0) FROM "${TABLE}" WHERE "${COL_VENUE}" = $venueID LIMIT 1`;
		let sQuery = `INSERT INTO "${TABLE}" ("${COL_VENUE}", "${COL_ORDER_NUMBER}", "${COL_PRICE}", "${COL_STATUS}") VALUES ($venueID, (${sSubQuery})+1, $price, $status)`;
		let oParams = {
			$venueID: venue,
			$price: price,
			$status: status,
		};
		return new Promise((resolve, reject) => {
			this.moDb.run(sQuery, oParams, function(err) {
				if(err) {
					reject(err);
				}
				else {
					resolve(this.lastID);
				}
			});
		});
	}
	deleteByOrderNumber(venue, orderNumber) {
		let sQuery = `DELETE FROM "${TABLE}" WHERE "${COL_VENUE}" = ? AND "${COL_ORDER_NUMBER}" = ?`;
		return new Promise((resolve, reject) => {
			this.moDb.run(sQuery, [venue, orderNumber], function(err) {
				if(err) {
					reject(err);
				}
				else {
					resolve(this.changes);
				}
			});
		});
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
	STATUS,
};
