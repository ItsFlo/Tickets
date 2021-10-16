import HttpDispatcher from "../../../modules/HttpDispatcher.js";
import TicketConfig from "../../TicketConfig.js";

class ItemPutDispatcher extends HttpDispatcher {
	dispatch(sPath, request, response, oPost) {
		if(sPath) {
			response.writeHead(404);
			response.end();
			return;
		}
		if(!oPost.hasOwnProperty("venue") || !oPost.venue) {
			response.writeHead(400);
			response.end("No id provided");
			return;
		}
		if(!oPost.hasOwnProperty("name") || !oPost.name) {
			response.writeHead(400);
			response.end("No name provided");
			return;
		}
		if(!oPost.hasOwnProperty("price") || !oPost.price) {
			response.writeHead(400);
			response.end("No price provided");
			return;
		}
		let iVenueID = parseInt(oPost.venue);
		let fPrice = parseFloat(oPost.price);
		if(isNaN(iVenueID) || isNaN(fPrice)) {
			response.writeHead(400);
			response.end();
			return;
		}

		TicketConfig.db.item.create(iVenueID, oPost.name, fPrice, (err, lastID) => {
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

export default ItemPutDispatcher;
