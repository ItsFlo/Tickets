const COL_ID = "id";

class DbTable {
	db;

	constructor(db) {
		this.db = db;
	}



	getOneWhere(where=null, whereValues=null, sortOrder=null) {
		let values = [];
		if(!Array.isArray(whereValues) && whereValues !== null) {
			whereValues = [whereValues];
		}
		let query = `SELECT * FROM "${this.constructor.TABLE}"`;

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
	getByID(id) {
		let where = `"${COL_ID}" = ?`;
		return this.getOneWhere(where, [id]);
	}

	getOrderClause(sortOrder) {
		if(Array.isArray(sortOrder)) {
			let orderClause = "";
			for(let sCol of sortOrder) {
				if(this.constructor.COLUMNS.includes(sCol)) {
					if(orderClause) {
						orderClause += ", ";
					}
					orderClause += `"${sCol}"`;
				}
			}
			if(orderClause) {
				return " ORDER BY " + orderClause + " ";
			}
		}
		else if(typeof sortOrder === "object") {
			let orderClause = "";
			let validDirections = ["ASC", "DESC"];
			for(let col in sortOrder) {
				if(this.constructor.COLUMNS.includes(col)) {
					let direction = sortOrder[col].toUpperCase();
					if(validDirections.includes(direction)) {
						if(orderClause) {
							orderClause += ", ";
						}
						orderClause += `"${col}" ${direction}`;
					}
				}
			}
			if(orderClause) {
				return " ORDER BY " + orderClause + " ";
			}
		}
		else if(typeof sortOrder === "string") {
			if(this.constructor.COLUMNS.includes(sortOrder)) {
				return ` ORDER BY "${sortOrder}" `;
			}
		}
		return "";
	}
	getLimitClause(limit, offset=0) {
		limit = parseInt(limit);
		offset = parseInt(offset);
		let ret = "";
		if(!isNaN(limit) && limit > 0) {
			ret =  ` LIMIT ${limit} `;
		}
		if(!isNaN(offset) && offset > 0) {
			ret += ` OFFSET ${offset}`;
		}
		return ret;
	}
	getAllWhere(where=null, whereValues=null, sortOrder=null, limit=null, offset=null) {
		let values = [];
		if(!Array.isArray(whereValues) && whereValues !== null) {
			whereValues = [whereValues];
		}
		let query = `SELECT * FROM "${this.constructor.TABLE}"`;

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
	getAll(sortOrder, limit) {
		return this.getAllWhere(null, null, sortOrder, limit);
	}

	updateWhere(where, whereValues, updates) {
		let query = `UPDATE "${this.constructor.TABLE}" SET `;
		let values = [];

		let rowsAreUpdated = false;
		for(let col in updates) {
			if(!updates.hasOwnProperty(col) || !this.constructor.COLUMNS.includes(col)) {
				continue;
			}
			if(rowsAreUpdated) {
				query += ", ";
			}
			query += `"${col}" = ?`;
			values.push(updates[col]);
			rowsAreUpdated = true;
		}
		if(!rowsAreUpdated) {
			throw new Error("no rows set for update");
		}

		query += ` WHERE ` + where;
		values = values.concat(whereValues);

		let stmt = this.db.prepare(query);
		let result = stmt.run(values);
		return result.changes;
	}
	update(id, updates) {
		let where = `"${COL_ID}" = ?`;
		return this.updateWhere(where, [id], updates);
	}

	create(values) {
		let columnPart = "";
		let valuePart = "";
		let cleanedValues = [];
		for(let col of this.constructor.COLUMNS) {
			if(col === COL_ID) {
				continue;
			}
			if(!values.hasOwnProperty(col)) {
				throw new Error("didn´t provide values for all columns: "+col);
			}

			if(columnPart) {
				columnPart += ", ";
			}
			columnPart += `"${col}"`;

			if(valuePart) {
				valuePart += ", ";
			}
			valuePart += "?";

			cleanedValues.push(values[col]);
		}

		let query = `INSERT INTO "${this.constructor.TABLE}" (` + columnPart + ") VALUES (" + valuePart + ")";
		let stmt = this.db.prepare(query);
		let result = stmt.run(cleanedValues);
		return result.lastInsertRowid;
	}
	delete(id) {
		let query = `DELETE FROM "${this.constructor.TABLE}" WHERE "${COL_ID}" = ?`;
		let stmt = this.db.prepare(query);
		let result = stmt.run(id);
		return result.changes;
	}
};



function addConstants(oClass, tableName, columnNames) {
	let properties = {
		TABLE: {
			value: tableName,
			writable: false,
		},
		COLUMNS: {
			value: columnNames,
			writable: false,
		},
	};
	Object.defineProperties(oClass, properties);
}

export default DbTable;
export {
	DbTable,
	addConstants,
	COL_ID,
};
