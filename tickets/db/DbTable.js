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

	getAllWhere(sWhere, aWhereValues, callback, order, limit) {
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
		if(Array.isArray(order)) {
			let sOrderClause = "";
			let aCols = [];
			for(let sCol of order) {
				if(this.constructor.COLUMNS.includes(sCol)) {
					if(sOrderClause) {
						sOrderClause += ", ";
					}
					sOrderClause += "?";
					aCols.push(sCol);
				}
			}
			if(aCols.length) {
				sQuery += " ORDER BY " + sOrderClause;
				aValues.concat(aCols);
			}
		}
		else if(typeof order === "object") {
			let sOrderClause = "";
			let aColValues = [];
			let aDirections = ["ASC", "DESC"];
			for(let sCol in order) {
				if(this.constructor.COLUMNS.includes(sCol)) {
					let sDirection = order[sCol].toUpperCase();
					if(aDirections.includes(sDirection)) {
						if(sOrderClause) {
							sOrderClause += ", ";
						}
						sOrderClause += "? ?";
						aColValues.push(sCol, sDirection);
					}
				}
			}
			if(aCols.length) {
				sQuery += " ORDER BY " + sOrderClause;
				aValues.concat(aCols);
			}
		}
		else if(typeof order === "string") {
			if(this.constructor.COLUMNS.includes(order)) {
				sQuery += " ORDER BY ?";
				aValues.push(order);
			}
		}

		//LIMIT
		if(!isNaN(parseInt(limit))) {
			sQuery += " LIMIT ?";
			aValues.push(limit);
		}
		this.moDb.all(sQuery, aValues, callback);
		return this;
	}
	getAll(callback, order, limit) {
		return this.getAllWhere(null, null, callback, order, limit);
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
