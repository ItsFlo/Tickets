import HttpDispatcher, { sendStatus } from "../../../modules/HttpDispatcher.js";
import TicketConfig from "../../TicketConfig.js";
import Events from "../../Events.js";
import Venue from "../../db/Venue.js";

class VenuePutDispatcher extends HttpDispatcher {
	request(sPath, request, response, oPost) {
		if(sPath) {
			sendStatus(response, 404);
			return;
		}
		if(!oPost.hasOwnProperty("name") || !oPost.name) {
			sendStatus(response, 400, "No name provided");
			return;
		}
		if(!oPost.hasOwnProperty("date") || !oPost.date.match(/^\d\d\d\d-\d\d-\d\d$/)) {
			sendStatus(response, 400, "No date provided");
			return;
		}
		if(!oPost.hasOwnProperty("time") || !oPost.time.match(/^\d\d:\d\d(:\d\d)?$/)) {
			sendStatus(response, 400, "No time provided");
			return;
		}

		TicketConfig.db.venue.create(oPost.name, oPost.date, oPost.time).then(lastID => {
			response.setHeader("Content-Type", "application/json");
			response.writeHead(201);
			response.end(JSON.stringify({
				id: lastID,
			}));

			Events.sendEvent(Venue.TABLE, "create", JSON.stringify({
				id: lastID,
				name: oPost.name,
				date: oPost.date,
				time: oPost.time,
			}));
		}, err => {
			sendStatus(response, 500, err.message);
		});
	}
};

export default VenuePutDispatcher;
