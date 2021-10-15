import { HttpDispatcherGroup } from "../../modules/HttpDispatcher.js";
import oVenueDispatcher from "./VenueDispatcher.js";

let oApiDispatcher = new class extends HttpDispatcherGroup {
	dispatch(sPath, request, response) {
		response.setHeader("Cache-Control", "no-store");
		if(request.headers["content-type"] !== "application/json") {
			response.writeHead(400);
			response.end("Content-Type 'application/json' expected");
			return;
		}

		let sRequestBody = "";
		request.on("data", (chunk) => sRequestBody += chunk);
		request.on("end", () => {
			try {
				let oJson = JSON.parse(sRequestBody);
				super.dispatch(sPath, request, response, oJson);
			} catch(err) {
				request.writeHead(400);
				request.end("JSON error");
			}
		});

	}
}(false);

oApiDispatcher.addDispatcher("venue", oVenueDispatcher);



function init() {

}

export default {
	init,
	apiDispatcher: oApiDispatcher,
};
