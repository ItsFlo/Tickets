import HttpDispatcher, { sendStatus, sendResult } from "../../../modules/HttpDispatcher.js";
import TicketConfig from "../../TicketConfig.js";
import Events from "../../Events.js";
import VenueCss from "../../db/VenueCss.js";

class VenueCssPutDispatcher extends HttpDispatcher {
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
		let css = post.css || "";

		try {
			let lastId = TicketConfig.db.venueCss.create(venueId, css);
			sendResult(response, {id: lastId}, 201);

			Events.sendEvent(VenueCss.TABLE, "create", {
				[VenueCss.COL_ID]: lastId,
				[VenueCss.COL_CSS]: css,
			});
		} catch (err) {
			sendStatus(response, 500, err.message);
		}
	}
};

export default VenueCssPutDispatcher;
