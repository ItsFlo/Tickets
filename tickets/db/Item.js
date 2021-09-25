const TABLE = "item";

const COL_ID = "id";
const COL_VENUE = "venue";
const COL_NAME = "name";
const COL_PRICE = "price";
const COLUMNS = [
	COL_ID,
	COL_VENUE,
	COL_NAME,
	COL_PRICE,
];


class Item {
	moDb;

	constructor(oDb) {
		this.moDb = oDb;
	}

	createTable(callback) {
		let sQuery = `CREATE TABLE IF NOT EXISTS "${TABLE}" ("${COL_ID}" INTEGER PRIMARY KEY, "${COL_VENUE}" INTEGER, "${COL_NAME}" TEXT, "${COL_PRICE}" REAL)`;
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
	getByName(venue, name, callback) {
		if(typeof callback !== "function") {
			return this;
		}
		let sQuery = `SELECT * FROM "${TABLE}" WHERE "${COL_VENUE}" = ? and "${COL_NAME}" = ?`;
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
	update(id, venue, name, price, callback) {
		let sQuery = `UPDATE "${TABLE}" SET "${COL_VENUE}" = ?, "${COL_NAME}" = ?, "${COL_PRICE}" = ? WHERE "${COL_ID}" = ?`;
		this.moDb.run(sQuery, [venue, name, price, id], (err) => {
			if(typeof callback === "function") {
				callback(err);
			}
		});
		return this;
	}
	create(venue, name, price, callback) {
		let sQuery = `INSERT INTO "${TABLE}" ("${COL_VENUE}", "${COL_NAME}", "${COL_PRICE}") VALUES (?, ?, ?)`;
		this.moDb.run(sQuery, [venue, name, price], function(err) {
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
}


export default {
	COL_ID,
	COL_VENUE,
	COL_NAME,
	COL_PRICE,
	COLUMNS,
	Item,
};
