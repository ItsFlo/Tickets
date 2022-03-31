const COL_ID = "id";

class DbTable {
	moDb;

	constructor(oDb) {
		this.moDb = oDb;
	}



	getByID(id) {
		let sQuery = `SELECT * FROM "${this.constructor.TABLE}" WHERE "${COL_ID}" = ? LIMIT 1`;
		return new Promise((resolve, reject) => {
			this.moDb.get(sQuery, [id], (err, rows) => {
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

	getOrderClause(sortOrder) {
		if(Array.isArray(sortOrder)) {
			let sOrderClause = "";
			for(let sCol of sortOrder) {
				if(this.constructor.COLUMNS.includes(sCol)) {
					if(sOrderClause) {
						sOrderClause += ", ";
					}
					sOrderClause += `"${sCol}"`;
				}
			}
			if(sOrderClause) {
				return " ORDER BY " + sOrderClause + " ";
			}
		}
		else if(typeof sortOrder === "object") {
			let sOrderClause = "";
			let aDirections = ["ASC", "DESC"];
			for(let sCol in sortOrder) {
				if(this.constructor.COLUMNS.includes(sCol)) {
					let sDirection = sortOrder[sCol].toUpperCase();
					if(aDirections.includes(sDirection)) {
						if(sOrderClause) {
							sOrderClause += ", ";
						}
						sOrderClause += `"${sCol}" ${sDirection}`;
					}
				}
			}
			if(sOrderClause) {
				return " ORDER BY " + sOrderClause + " ";
			}
		}
		else if(typeof sortOrder === "string") {
			if(this.constructor.COLUMNS.includes(sortOrder)) {
				return ` ORDER BY "${sortOrder}" `;
			}
		}
		return "";
	}
	getLimitClause(limit) {
		let iLimit = parseInt(limit);
		if(!isNaN(iLimit) && iLimit > 0) {
			return ` LIMIT ${iLimit} `;
		}
		return "";
	}
	getAllWhere(sWhere, aWhereValues, sortOrder, limit) {
		let aValues = [];
		let sQuery = `SELECT * FROM "${this.constructor.TABLE}"`;

		//WHERE
		if(sWhere) {
			sQuery += " WHERE " + sWhere;
			aValues = aWhereValues;
		}

		//ORDER BY
		sQuery += this.getOrderClause(sortOrder);

		//LIMIT
		sQuery += this.getLimitClause(limit);

		return new Promise((resolve, reject) => {
			this.moDb.all(sQuery, aValues, (err, rows) => {
				if(err) {
					reject(err);
				}
				else {
					resolve(rows);
				}
			});
		});
	}
	getAll(sortOrder, limit) {
		return this.getAllWhere(null, null, callback, sortOrder, limit);
	}

	updateWhere(where, aWhereValues, updates) {
		let sQuery = `UPDATE "${this.constructor.TABLE}" SET `;
		let aValues = [];

		let bRowUpdated = false;
		for(let sCol in updates) {
			if(!updates.hasOwnProperty(sCol) || !this.constructor.COLUMNS.includes(sCol)) {
				continue;
			}
			if(bRowUpdated) {
				sQuery += ", ";
			}
			sQuery += `"${sCol}" = ?`;
			aValues.push(updates[sCol]);
			bRowUpdated = true;
		}
		if(!bRowUpdated) {
			return Promise.reject(new Error("no rows set for update"));
		}

		sQuery += ` WHERE ` + where;
		aValues = aValues.concat(aWhereValues);

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
	update(id, updates) {
		let sWhere = `"${COL_ID}" = ?`;
		return this.updateWhere(sWhere, [id], updates);
	}

	create(values) {
		let sColumnPart = "";
		let sValuePart = "";
		let aValues = [];
		for(let sCol of this.constructor.COLUMNS) {
			if(sCol === COL_ID) {
				continue;
			}
			if(!values.hasOwnProperty(sCol)) {
				return Promise.reject(new Error("didn´t provide values for all columns: "+sCol));
			}

			if(sColumnPart) {
				sColumnPart += ", ";
			}
			sColumnPart += `"${sCol}"`;

			if(sValuePart) {
				sValuePart += ", ";
			}
			sValuePart += "?";

			aValues.push(values[sCol]);
		}

		let sQuery = `INSERT INTO "${this.constructor.TABLE}" (` + sColumnPart + ") VALUES (" + sValuePart + ")";
		return new Promise((resolve, reject) => {
			this.moDb.run(sQuery, aValues, function(err) {
				if(err) {
					reject(err);
				}
				else {
					resolve(this.lastID);
				}
			});
		});
	}
	delete(id) {
		let sQuery = `DELETE FROM "${this.constructor.TABLE}" WHERE "${COL_ID}" = ?`;
		return new Promise((resolve, reject) => {
			this.moDb.run(sQuery, [id], function(err) {
				if(err) {
					reject(err);
				}
				else {
					resolve(this.changes);
				}
			});
		});
	}
};



function addConstants(oClass, sTableName, aColumnNames) {
	let oProperties = {
		TABLE: {
			value: sTableName,
			writable: false,
		},
		COLUMNS: {
			value: aColumnNames,
			writable: false,
		},
	};
	Object.defineProperties(oClass, oProperties);
}

export default DbTable;
export {
	DbTable,
	addConstants,
	COL_ID,
};
