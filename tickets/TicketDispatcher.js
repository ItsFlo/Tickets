import { HttpDispatcherGroup } from "../modules/HttpDispatcher.js";
import Api from "./api/ApiDispatcher.js";
import DbConnection from "./db/dbConnection.js";
import FrontEndDispatcher from "./FrontEndDispatcher.js";

let oTicketDispatcher = new HttpDispatcherGroup();
oTicketDispatcher.addDispatcher("api", Api.apiDispatcher);
oTicketDispatcher.addDispatcher("/", FrontEndDispatcher.frontEndDispatcher);


function init(oConfig) {
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
	let oDbConnection = new DbConnection(sDbPath);

	Api.init(oConfig, oDbConnection);
}

export default {
	init,
	ticketDispatcher: oTicketDispatcher,
}
