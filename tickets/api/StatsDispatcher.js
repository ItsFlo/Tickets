import HttpDispatcher, { HttpDispatcherGroup, sendResult, sendStatus } from "../../modules/HttpDispatcher.js";
import TicketConfig from "../TicketConfig.js";


let statsDispatcher = new HttpDispatcherGroup();
statsDispatcher.addDispatcher("venue", new class extends HttpDispatcher {
	request(path, request, response) {
		if(path) {
			sendStatus(response, 404);
			return;
		}
		let searchParams = this.getSearchParams(request, false);
		let venueId = parseInt(searchParams.get("id"));

		try {
			let stats = TicketConfig.db.venue.getStats(venueId);
			sendResult(response, stats);
		} catch (err) {
			sendStatus(response, 500, err.message);
		}
	}
});

statsDispatcher.addDispatcher("itemCategory", new class extends HttpDispatcher {
	request(path, request, response) {
		if(path) {
			sendStatus(response, 404);
			return;
		}
		let searchParams = this.getSearchParams(request, false);
		let venueId = parseInt(searchParams.get("venue"));

		try {
			let stats = TicketConfig.db.itemCategory.getStats(venueId);
			sendResult(response, stats);
		} catch (err) {
			sendStatus(response, 500, err.message);
		}
	}
});

statsDispatcher.addDispatcher("item", new class extends HttpDispatcher {
	request(path, request, response) {
		if(path) {
			sendStatus(response, 404);
			return;
		}
		let searchParams = this.getSearchParams(request, false);
		let venueId = parseInt(searchParams.get("venue"));
		let itemCategoryId = parseInt(searchParams.get("category"));

		try {
			let stats = TicketConfig.db.item.getStats(venueId, itemCategoryId);
			sendResult(response, stats);
		} catch (err) {
			sendStatus(response, 500, err.message);
		}
	}
});

export default statsDispatcher;
