import HttpDispatcher from "../../../modules/HttpDispatcher.js";
import TicketConfig from "../../TicketConfig.js";
import Venue from "../../db/Venue.js";

class VenuePatchDispatcher extends HttpDispatcher {
	dispatch(sPath, request, response, oPost) {
		if(sPath) {
			response.writeHead(404);
			response.end();
			return;
		}
		if(!oPost.hasOwnProperty("id") || isNaN(parseInt(oPost.id))) {
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

		TicketConfig.db.venue.update(oPost.id, oUpdates, (err, lastID) => {
			if(err) {
				response.writeHead(500);
				response.end(err.message);
			}
			else {
				response.setHeader("Content-Type", "application/json");
				response.writeHead(200);
				response.end(JSON.stringify({
					id: lastID,
				}));
			}
		});
	}
};

export default VenuePatchDispatcher;
