import HttpDispatcher from "../../../modules/HttpDispatcher.js";
import TicketConfig from "../../TicketConfig.js";
import Venue from "../../db/Venue.js";

class VenuePatchDispatcher extends HttpDispatcher {
	request(sPath, request, response, oPost) {
		if(sPath) {
			response.writeHead(404);
			response.end();
			return;
		}
		let iID = parseInt(oPost.id);
		if(isNaN(iID)) {
			response.writeHead(400);
			response.end("No id provided");
			return;
		}

		let oUpdates = {};
		let bRowsUpdated = false;
		if(oPost.hasOwnProperty("name")) {
			if(!oPost.name) {
				response.writeHead(400);
				response.end("Name must not be empty");
				return;
			}
			oUpdates[Venue.COL_NAME] = oPost.name;
			bRowsUpdated = true;
		}
		if(oPost.hasOwnProperty("date")) {
			if(!oPost.date.match(/^\d\d\d\d-\d\d-\d\d$/)) {
				response.writeHead(400);
				response.end("No date provided");
				return;
			}
			oUpdates[Venue.COL_DATE] = oPost.date;
			bRowsUpdated = true;
		}
		if(oPost.hasOwnProperty("time")) {
			if(!oPost.time.match(/^\d\d:\d\d(:\d\d)?$/)) {
				response.writeHead(400);
				response.end("No time provided");
				return;
			}
			oUpdates[Venue.COL_TIME] = oPost.time;
			bRowsUpdated = true;
		}


		if(!bRowsUpdated) {
			response.writeHead(400);
			response.end("no rows set to update");
			return;
		}

		TicketConfig.db.venue.update(iID, oUpdates, (err, changes) => {
			if(err) {
				response.writeHead(500);
				response.end(err.message);
			}
			else {
				response.setHeader("Content-Type", "application/json");
				response.writeHead(200);
				response.end("{}");

				if(changes) {
					oUpdates.id = iID;
					Events.sendEvent(Venue.TABLE, "update", JSON.stringify(oUpdates));
				}
			}
		});
	}
};

export default VenuePatchDispatcher;
