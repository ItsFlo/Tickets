import HttpDispatcher from "../../../modules/HttpDispatcher.js";
import TicketConfig from "../../TicketConfig.js";

class ItemCategoryPutDispatcher extends HttpDispatcher {
	request(sPath, request, response, oPost) {
		if(sPath) {
			response.writeHead(404);
			response.end();
			return;
		}
		let iVenueID = parseInt(oPost.venue);
		if(isNaN(iVenueID)) {
			response.writeHead(400);
			response.end("No venue provided");
			return;
		}
		if(!oPost.hasOwnProperty("name") || !oPost.name) {
			response.writeHead(400);
			response.end("No name provided");
			return;
		}

		TicketConfig.db.itemCategory.create(iVenueID, oPost.name, (err, lastID) => {
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

export default ItemCategoryPutDispatcher;
