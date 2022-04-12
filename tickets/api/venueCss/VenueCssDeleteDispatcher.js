import HttpDispatcher, { sendResult, sendStatus } from "../../../modules/HttpDispatcher.js";
import TicketConfig from "../../TicketConfig.js";
import Events from "../../Events.js";
import VenueCss from "../../db/VenueCss.js";

class VenueCssDeleteDispatcher extends HttpDispatcher {
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

		try {
			let changes = TicketConfig.db.venueCss.delete(venueId);
			sendResult(response);

			if(changes) {
				Events.sendEvent(VenueCss.TABLE, "delete", {
					[VenueCss.COL_ID]: venueId,
				});
			}
		} catch (err) {
			sendStatus(response, 500, err.message);
		}
	}
};

export default VenueCssDeleteDispatcher;
