import DbConnection from "./db/dbConnection.js";


let oConfig = null;
let oDbConnection = null;

class TicketConfig {
	static init(conf) {
		oConfig = conf;

		let sDbPath = oConfig.getElement("database.file", null);
		if(!sDbPath) {
			throw new Exception("database file has to be set");
		}
		if(process.platform === "win32") {
			if(!sDbPath.match(/^[a-zA-Z]:\//)) {
				if(sDbPath[0] !== "/") {
					sDbPath = __rootpath+"/"+sDbPath;
				}
				else {
					sDbPath = __rootpath+sDbPath;
				}
			}
		}
		else {
			if(sDbPath[0] !== "/") {
				sDbPath = __rootpath+"/"+sDbPath;
			}
		}
		oDbConnection = new DbConnection(sDbPath);
	}


	static get config() {
		return oConfig;
	}

	static get db() {
		return oDbConnection;
	}
}

export default TicketConfig;
