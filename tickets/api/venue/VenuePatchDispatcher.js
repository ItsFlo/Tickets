import HttpDispatcher, { sendStatus } from "../../../modules/HttpDispatcher.js";
import TicketConfig from "../../TicketConfig.js";
import Events from "../../Events.js";
import Venue from "../../db/Venue.js";

class VenuePatchDispatcher extends HttpDispatcher {
	request(path, request, response, post) {
		if(path) {
			sendStatus(response, 404);
			return;
		}
		let id = parseInt(post.id);
		if(isNaN(id)) {
			sendStatus(response, 400, "No id provided");
			return;
		}

		let updates = {};
		let rowsAreUpdated = false;
		if(post.hasOwnProperty("name")) {
			if(!post.name) {
				sendStatus(response, 400, "Name must not be empty");
				return;
			}
			updates[Venue.COL_NAME] = post.name;
			rowsAreUpdated = true;
		}
		if(post.hasOwnProperty("date")) {
			if(!post.date.match(/^\d\d\d\d-\d\d-\d\d$/)) {
				sendStatus(response, 400, "Invalid date");
				return;
			}
			updates[Venue.COL_DATE] = post.date;
			rowsAreUpdated = true;
		}
		if(post.hasOwnProperty("time")) {
			if(!post.time.match(/^\d\d:\d\d(:\d\d)?$/)) {
				sendStatus(response, 400, "Invalid time");
				return;
			}
			updates[Venue.COL_TIME] = post.time;
			rowsAreUpdated = true;
		}


		if(!rowsAreUpdated) {
			sendStatus(response, 400, "no rows set to update");
			return;
		}

		try {
			let changes = TicketConfig.db.venue.update(id, updates);
			response.setHeader("Content-Type", "application/json");
			response.writeHead(200);
			response.end("{}");

			if(changes) {
				updates.id = id;
				Events.sendEvent(Venue.TABLE, "update", JSON.stringify(updates));
			}
		} catch (err) {
			sendStatus(response, 500, err.message);
		}
	}
};

export default VenuePatchDispatcher;
