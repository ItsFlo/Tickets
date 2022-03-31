import HttpDispatcher, { sendStatus } from "../../../modules/HttpDispatcher.js";
import TicketConfig from "../../TicketConfig.js";
import Events from "../../Events.js";
import Venue from "../../db/Venue.js";

class VenuePatchDispatcher extends HttpDispatcher {
	request(sPath, request, response, oPost) {
		if(sPath) {
			sendStatus(response, 404);
			return;
		}
		let iID = parseInt(oPost.id);
		if(isNaN(iID)) {
			sendStatus(response, 400, "No id provided");
			return;
		}

		let oUpdates = {};
		let bRowsUpdated = false;
		if(oPost.hasOwnProperty("name")) {
			if(!oPost.name) {
				sendStatus(response, 400, "Name must not be empty");
				return;
			}
			oUpdates[Venue.COL_NAME] = oPost.name;
			bRowsUpdated = true;
		}
		if(oPost.hasOwnProperty("date")) {
			if(!oPost.date.match(/^\d\d\d\d-\d\d-\d\d$/)) {
				sendStatus(response, 400, "No date provided");
				return;
			}
			oUpdates[Venue.COL_DATE] = oPost.date;
			bRowsUpdated = true;
		}
		if(oPost.hasOwnProperty("time")) {
			if(!oPost.time.match(/^\d\d:\d\d(:\d\d)?$/)) {
				sendStatus(response, 400, "No time provided");
				return;
			}
			oUpdates[Venue.COL_TIME] = oPost.time;
			bRowsUpdated = true;
		}


		if(!bRowsUpdated) {
			sendStatus(response, 400, "no rows set to update");
			return;
		}

		TicketConfig.db.venue.update(iID, oUpdates).then(changes => {
			response.setHeader("Content-Type", "application/json");
			response.writeHead(200);
			response.end("{}");

			if(changes) {
				oUpdates.id = iID;
				Events.sendEvent(Venue.TABLE, "update", JSON.stringify(oUpdates));
			}
		}, err => {
			sendStatus(response, 500, err.message);
		});
	}
};

export default VenuePatchDispatcher;
