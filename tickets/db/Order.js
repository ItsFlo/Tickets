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
const STATUS_DONE = "DONE";
const STATUS_PICKUP = "PICKUP";
const STATUS = [
	STATUS_OPEN,
	STATUS_DONE,
	STATUS_PICKUP,
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
			"${COL_ORDER_TIMESTAMP}" TEXT DEFAULT CURRENT_TIMESTAMP,
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

	getAllByVenue(venue, callback, sortOrder, limit) {
		let sWhere = `"${COL_VENUE}" = ?`;
		return this.getAllWhere(sWhere, [venue], callback, sortOrder, limit);
	}
	getAllByStatus(status, callback, sortOrder, limit) {
		let sWhere = `"${COL_STATUS}" = ?`;
		return this.getAllWhere(sWhere, [status], callback, sortOrder, limit);
	}
	getAllByVenueStatus(venue, status, callback, sortOrder, limit) {
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

		return this.getAllWhere(sWhere, aValues, callback, sortOrder, limit);
	}

	updateByOrderNumber(venue, orderNumber, updates, callback) {
		let sWhere = `"${COL_VENUE}" = ? AND "${COL_ORDER_NUMBER}" = ?`;
		return this.updateWhere(sWhere, [venue, orderNumber], updates, callback);
	}
	updateDone(iID, callback) {
		let sWhere = `"${COL_ID}" = ? AND "${COL_STATUS}" = ?`;
		let aValues = [
			iID,
			STATUS_OPEN,
		];
		let oUpdates = {
			[COL_STATUS]: STATUS_DONE,
			[COL_DONE_TIMESTAMP]: this.formatDate(new Date()),
		};
		return this.updateWhere(sWhere, aValues, oUpdates, callback);
	}
	updatePickup(iID, callback) {
		let sWhere = `"${COL_ID}" = ? AND "${COL_STATUS}" = ?`;
		let aValues = [
			iID,
			STATUS_DONE,
		];
		let oUpdates = {
			[COL_STATUS]: STATUS_PICKUP,
			[COL_PICKUP_TIMESTAMP]: this.formatDate(new Date()),
		};
		return this.updateWhere(sWhere, aValues, oUpdates, callback);
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



	recalculatePrice(id, callback) {
		id = parseInt(id);
		if(isNaN(id)) {
			if(typeof callback === "function") {
				callback(Error("No id provided"));
			}
			return;
		}

		let sSubQuery = `SELECT SUM(it."${Item.COL_PRICE}" * oi."${OrderItem.COL_COUNT}") FROM "${OrderItem.TABLE}" oi INNER JOIN "${Item.TABLE}" it ON oi."${OrderItem.COL_ITEM}" = it."${Item.COL_ID}"`
					+ ` WHERE oi."${OrderItem.COL_ORDER}" = ?`;

		let sQuery = `UPDATE "${TABLE}" SET "${COL_PRICE}" = (${sSubQuery}) WHERE "${COL_ID}" = ?`;
		let aValues = [id, id];

		this.moDb.run(sQuery, aValues, callback);
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

	STATUS_OPEN,
	STATUS_DONE,
	STATUS_PICKUP,
	STATUS,
};
