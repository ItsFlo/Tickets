import HttpDispatcher, { sendStatus } from "../../../modules/HttpDispatcher.js";
import TicketConfig from "../../TicketConfig.js";
import Events from "../../Events.js";
import Venue from "../../db/Venue.js";

class VenueDeleteDispatcher extends HttpDispatcher {
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

		TicketConfig.db.venue.delete(iID).then(changes => {
			response.setHeader("Content-Type", "application/json");
			response.writeHead(200);
			response.end("{}");

			if(changes) {
				Events.sendEvent(Venue.TABLE, "delete", JSON.stringify({
					id: iID,
				}));
			}
		}, err => {
			sendStatus(response, 500, err.message);
		});
	}
};

export default VenueDeleteDispatcher;
