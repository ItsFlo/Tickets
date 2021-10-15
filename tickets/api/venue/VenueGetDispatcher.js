import HttpDispatcher from "../../../modules/HttpDispatcher.js";
import TicketConfig from "../../TicketConfig.js";
import Venue from "../../db/Venue.js";

class VenueGetDispatcher extends HttpDispatcher {
	dispatch(sPath, request, response, oPost) {
		if(sPath) {
			response.writeHead(404);
			response.end();
			return;
		}
		let dispatchFunction = null;

		if(!isNaN(parseInt(oPost.id))) {
			dispatchFunction = this.dispatchId;
		}
		else if(oPost.hasOwnProperty("all")) {
			dispatchFunction = this.dispatchAll;
		}
		else if(oPost.hasOwnProperty("name")) {
			dispatchFunction = this.dispatchName;
		}
		else if(oPost.hasOwnProperty("date")) {
			dispatchFunction = this.dispatchDate;
		}

		if(dispatchFunction) {
			dispatchFunction(response, oPost);
		}
		else {
			response.writeHead("400");
			response.end();
		}
	}


	getOrderDirection(oPost, sDefaultOrderDirection = "ASC") {
		let aOrderDirections = ["ASC", "DESC"];
		if(oPost.hasOwnProperty("order") && aOrderDirections.includes(oPost.order)) {
			return oPost.order;
		}
		if(aOrderDirections.includes(sDefaultOrderDirection)) {
			return sDefaultOrderDirection;
		}
		return "ASC";
	}



	dispatchId(response, oPost) {
		TicketConfig.db.venue.getByID(oPost.id, (err, row) => {
			if(err) {
				response.writeHead(500);
				response.end(err.message);
			}
			else {
				response.setHeader("Content-Type", "application/json");
				response.writeHead(200);
				response.end(JSON.stringify(row));
			}
		});
	}


	dispatchAll(response, oPost) {
		let sOrderDirection = this.getOrderDirection(oPost, "DESC");;
		let oOrder = {
			[Venue.COL_DATE]: sOrderDirection,
			[Venue.COL_TIME]: sOrderDirection,
		};
		TicketConfig.db.venue.getAll((err, rows) => {
			if(err) {
				response.writeHead(500);
				response.end(err.message);
			}
			else {
				response.setHeader("Content-Type", "application/json");
				response.writeHead(200);
				response.end(JSON.stringify(rows));
			}
		}, oOrder, oPost.limit);
	}


	dispatchName(response, oPost) {
		TicketConfig.db.venue.getByName(oPost.name, (err, row) => {
			if(err) {
				response.writeHead(500);
				response.end(err.message);
			}
			else {
				response.setHeader("Content-Type", "application/json");
				response.writeHead(200);
				response.end(JSON.stringify(row));
			}
		});
	}


	dispatchDate(response, oPost) {
		let sOrderDirection = this.getOrderDirection(oPost, "DESC");
		let oOrder = {
			[Venue.COL_DATE]: sOrderDirection,
			[Venue.COL_TIME]: sOrderDirection,
		};
		TicketConfig.db.venue.getAllByDate(oPost.date, (err, rows) => {
			if(err) {
				response.writeHead(500);
				response.end(err.message);
			}
			else {
				response.setHeader("Content-Type", "application/json");
				response.writeHead(200);
				response.end(JSON.stringify(rows));
			}
		}, oOrder, oPost.limit);
	}
};

export default VenueGetDispatcher;
