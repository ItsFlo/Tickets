const COL_ID = "id";

class DbTable {
	moDb;

	constructor(oDb) {
		this.moDb = oDb;
	}



	getByID(id, callback) {
		if(typeof callback !== "function") {
			return this;
		}
		let sQuery = `SELECT * FROM "${this.constructor.TABLE}" WHERE "${COL_ID}" = ? LIMIT 1`;
		this.moDb.get(sQuery, [id], callback);
		return this;
	}

	getAllWhere(sWhere, aWhereValues, callback, sortOrder, limit) {
		if(typeof callback !== "function") {
			return this;
		}

		let aValues = [];
		let sQuery = `SELECT * FROM "${this.constructor.TABLE}"`;

		//WHERE
		if(sWhere) {
			sQuery += " WHERE " + sWhere;
			aValues = aWhereValues;
		}

		//ORDER BY
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
				sQuery += " ORDER BY " + sOrderClause;
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
				sQuery += " ORDER BY " + sOrderClause;
			}
		}
		else if(typeof sortOrder === "string") {
			if(this.constructor.COLUMNS.includes(sortOrder)) {
				sQuery += ` ORDER BY "${sortOrder}"`;
			}
		}

		//LIMIT
		let iLimit = parseInt(limit);
		if(!isNaN(iLimit) && iLimit > 0) {
			sQuery += " LIMIT ?";
			aValues.push(iLimit);
		}
		this.moDb.all(sQuery, aValues, callback);
		return this;
	}
	getAll(callback, sortOrder, limit) {
		return this.getAllWhere(null, null, callback, sortOrder, limit);
	}

	updateWhere(where, aWhereValues, updates, callback) {
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
			if(typeof callback === "function") {
				callback(new Error("no rows set for update"));
			}
			return this;
		}

		sQuery += ` WHERE ` + where;
		aValues.concat(aWhereValues);

		this.moDb.run(sQuery, aValues, (err) => {
			if(typeof callback === "function") {
				callback(err);
			}
		});
		return this;
	}
	update(id, updates, callback) {
		let sWhere = `"${COL_ID} = ?"`;
		return this.updateWhere(sWhere, [id], updates, callback);
	}

	create(values, callback) {
		let sColumnPart = "";
		let sValuePart = "";
		let aValues = [];
		for(let sCol of this.constructor.COLUMNS) {
			if(sCol !== COL_ID && !values.hasOwnProperty(sCol)) {
				if(typeof callback === "function") {
					callback(new Error("didn´t provide values for all columns: "+sCol));
				}
				return this;
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
		this.moDb.run(sQuery, aValues, function(err) {
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
		let sQuery = `DELETE FROM "${this.constructor.TABLE}" WHERE "${COL_ID}" = ?`;
		this.moDb.run(sQuery, [id], callback);
		return this;
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
