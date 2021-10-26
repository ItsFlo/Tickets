import HttpDispatcher from "../../../modules/HttpDispatcher.js";
import TicketConfig from "../../TicketConfig.js";
import Venue from "../../db/Venue.js";

class VenueDeleteDispatcher extends HttpDispatcher {
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

		TicketConfig.db.venue.delete(iID, (err, changes) => {
			if(err) {
				response.writeHead(500);
				response.end(err.message);
			}
			else {
				response.setHeader("Content-Type", "application/json");
				response.writeHead(200);
				response.end("{}");

				if(changes) {
					Events.sendEvent(Venue.TABLE, "delete", JSON.stringify({
						id: iID,
					}));
				}
			}
		});
	}
};

export default VenueDeleteDispatcher;
