import HttpDispatcher, { sendStatus } from "../../../modules/HttpDispatcher.js";
import TicketConfig from "../../TicketConfig.js";
import Events from "../../Events.js";
import Venue from "../../db/Venue.js";

class VenuePutDispatcher extends HttpDispatcher {
	request(path, request, response, post) {
		if(path) {
			sendStatus(response, 404);
			return;
		}
		if(!post.hasOwnProperty("name") || !post.name) {
			sendStatus(response, 400, "No name provided");
			return;
		}
		if(!post.hasOwnProperty("date") || !post.date.match(/^\d\d\d\d-\d\d-\d\d$/)) {
			sendStatus(response, 400, "No date provided");
			return;
		}
		if(!post.hasOwnProperty("time") || !post.time.match(/^\d\d:\d\d(:\d\d)?$/)) {
			sendStatus(response, 400, "No time provided");
			return;
		}

		try {
			let lastID = TicketConfig.db.venue.create(post.name, post.date, post.time);
			response.setHeader("Content-Type", "application/json");
			response.writeHead(201);
			response.end(JSON.stringify({
				id: lastID,
			}));

			Events.sendEvent(Venue.TABLE, "create", {
				id: lastID,
				name: post.name,
				date: post.date,
				time: post.time,
			});
		} catch (err) {
			sendStatus(response, 500, err.message);
		}
	}
};

export default VenuePutDispatcher;
