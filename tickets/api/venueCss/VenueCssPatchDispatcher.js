import HttpDispatcher, { sendResult, sendStatus } from "../../../modules/HttpDispatcher.js";
import TicketConfig from "../../TicketConfig.js";
import Events from "../../Events.js";
import VenueCss from "../../db/VenueCss.js";

class VenueCssPatchDispatcher extends HttpDispatcher {
	request(path, request, response, post) {
		if(path) {
			sendStatus(response, 404);
			return;
		}
		let venueId = parseInt(post.venue);
		if(isNaN(venueId)) {
			sendStatus(response, 400, "No venue provided");
			return;
		}

		if(!post.hasOwnProperty("css")) {
			sendStatus(response, 400, "no css sent");
			return;
		}
		let updates = {
			[VenueCss.COL_CSS]: post.css || "",
		};

		try {
			let changes = TicketConfig.db.venueCss.update(venueId, updates);
			sendResult(response);

			if(changes) {
				updates[VenueCss.COL_ID] = venueId;
				Events.sendEvent(VenueCss.TABLE, "update", JSON.stringify(updates));
			}
		} catch (err) {
			sendStatus(response, 500, err.message);
		}
	}
};

export default VenueCssPatchDispatcher;
