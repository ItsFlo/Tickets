import HttpDispatcher from "../../../modules/HttpDispatcher.js";
import TicketConfig from "../../TicketConfig.js";

class VenuePutDispatcher extends HttpDispatcher {
	request(sPath, request, response, oPost) {
		if(sPath) {
			response.writeHead(404);
			response.end();
			return;
		}
		if(!oPost.hasOwnProperty("name") || !oPost.name) {
			response.writeHead(400);
			response.end("No name provided");
			return;
		}
		if(!oPost.hasOwnProperty("date") || !oPost.date.match(/^\d\d\d\d-\d\d-\d\d$/)) {
			response.writeHead(400);
			response.end("No date provided");
			return;
		}
		if(!oPost.hasOwnProperty("time") || !oPost.time.match(/^\d\d:\d\d(:\d\d)?$/)) {
			response.writeHead(400);
			response.end("No time provided");
			return;
		}

		TicketConfig.db.venue.create(oPost.name, oPost.date, oPost.time, (err, lastID) => {
			if(err) {
				response.writeHead(500);
				response.end(err.message);
			}
			else {
				response.setHeader("Content-Type", "application/json");
				response.writeHead(201);
				response.end(JSON.stringify({
					id: lastID,
				}));
			}
		});
	}
};

export default VenuePutDispatcher;
