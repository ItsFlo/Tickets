import HttpDispatcher, { sendStatus } from "../modules/HttpDispatcher.js";
import TicketConfig from "./TicketConfig.js";

class VenueStyleDispatcher extends HttpDispatcher {
	request(path, request, response) {
		let pathElements = path.split(".");
		if(pathElements.length !== 2 || pathElements[1].toUpperCase() !== "CSS" || path.includes("/")) {
			sendStatus(response, 404);
			return;
		}
		let venueId = parseInt(pathElements[0]);
		if(isNaN(venueId)) {
			sendStatus(response, 404);
			return;
		}

		try {
			let resultRow = TicketConfig.db.venueCss.getByID(venueId);
			let css = "";
			if(resultRow) {
				css = resultRow.css;
			}
			response.setHeader("Content-Type", "text/css");
			response.writeHead(200);
			response.end(css);
		} catch (err) {
			sendStatus(response, 500, err.message);
		}
	}
};

export default VenueStyleDispatcher;
