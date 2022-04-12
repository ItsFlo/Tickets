import HttpDispatcher, { sendResult, sendStatus } from "../../../modules/HttpDispatcher.js";
import TicketConfig from "../../TicketConfig.js";

class VenueCssGetDispatcher extends HttpDispatcher {
	request(path, request, response) {
		if(path) {
			sendStatus(response, 404);
			return;
		}
		let searchParams = this.getSearchParams(request, false);
		let venueId = parseInt(searchParams.get("venue"));
		if(isNaN(venueId)) {
			sendStatus(response, 400, "No id provided");
			return;
		}

		try {
			let resultRow = TicketConfig.db.venueCss.getByID(venueId);
			if(!resultRow) {
				sendStatus(response, 404);
			}
			else {
				sendResult(response, resultRow);
			}
		} catch (err) {
			sendStatus(response, 500, err.message);
		}
	}
};

export default VenueCssGetDispatcher;
