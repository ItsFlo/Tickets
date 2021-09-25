const TABLE = "venue";

const COL_ID = "id";
const COL_NAME = "name";
const COL_DATE = "date";
const COL_TIME = "time";
const COLUMNS = [
	COL_ID,
	COL_NAME,
	COL_DATE,
	COL_TIME,
];


class Venue {
	moDb;

	constructor(oDb) {
		this.moDb = oDb;
	}

	createTable(callback) {
		let sQuery = `CREATE TABLE IF NOT EXISTS "${TABLE}" ("${COL_ID}" INTEGER PRIMARY KEY, "${COL_NAME}" TEXT UNIQUE, "${COL_DATE}" TEXT, "${COL_TIME}" TEXT)`;
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
	getByName(name, callback) {
		if(typeof callback !== "function") {
			return this;
		}
		let sQuery = `SELECT * FROM "${TABLE}" WHERE "${COL_NAME}" = ?`;
		this.moDb.get(sQuery, [name], callback);
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
	update(id, name, date, time, callback) {
		let sQuery = `UPDATE "${TABLE}" SET "${COL_NAME}" = ?, "${COL_DATE}" = ?, "${COL_TIME}" = ? WHERE "${COL_ID}" = ?`;
		this.moDb.run(sQuery, [name, date, time, id], (err) => {
			if(typeof callback === "function") {
				callback(err);
			}
		});
		return this;
	}
	create(name, date, time, callback) {
		let sQuery = `INSERT INTO "${TABLE}" ("${COL_NAME}", "${COL_DATE}", "${COL_TIME}") VALUES (?, ?, ?)`;
		this.moDb.run(sQuery, [name, date, time], function(err) {
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
	COL_NAME,
	COL_DATE,
	COL_TIME,
	COLUMNS,
	Venue,
};
