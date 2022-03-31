import DbConnection from "./db/dbConnection.js";


let config = null;
let dbConnection = null;

class TicketConfig {
	static init(conf) {
		if(dbConnection && dbConnection.open) {
			return;
		}
		config = conf;

		let dbPath = config.getElement("database.file", null);
		if(!dbPath) {
			throw new Error("database file has to be set");
		}
		if(process.platform === "win32") {
			if(!dbPath.match(/^[a-zA-Z]:\//)) {
				if(dbPath[0] !== "/") {
					dbPath = __rootpath+"/"+dbPath;
				}
				else {
					dbPath = __rootpath+dbPath;
				}
			}
		}
		else {
			if(dbPath[0] !== "/") {
				dbPath = __rootpath+"/"+dbPath;
			}
		}
		dbConnection = new DbConnection(dbPath);
	}


	static get config() {
		return config;
	}

	static get db() {
		return dbConnection;
	}
}

export default TicketConfig;
