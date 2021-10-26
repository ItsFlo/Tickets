import HttpDispatcher from "../../../modules/HttpDispatcher.js";
import TicketConfig from "../../TicketConfig.js";
import OrderGetter from "./OrderGetter.js";

class OrderGetDispatcher extends HttpDispatcher {
	request(sPath, request, response) {
		if(!sPath) {
			response.writeHead(400);
			response.end();
			return;
		}
		let aPathElements = this.splitPath(sPath);
		let dispatchFunction = null;

		switch(aPathElements[0].toUpperCase()) {
			case "ID":
				dispatchFunction = this.dispatchId;
				break;

			case "ALL":
				dispatchFunction = this.dispatchAll;
				break;
		}

		if(dispatchFunction) {
			aPathElements.shift();
			dispatchFunction.call(this, response, aPathElements);
		}
		else {
			response.writeHead("400");
			response.end();
		}
	}


	dispatchId(response, aPathElements) {
		if(!aPathElements.length || isNaN(parseInt(aPathElements[0]))) {
			response.writeHead(400);
			response.end("No ID provided");
			return;
		}
		if(aPathElements.length > 1) {
			response.writeHead(400);
			response.end("Too many arguments");
			return;
		}
		let iID = parseInt(aPathElements[0]);
		TicketConfig.db.order.getByID(iID, (err, row) => {
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


	dispatchAll(response, aPathElements) {
		let iVenueID = NaN;
		let aStatus = [];
		let iLen = aPathElements.length;
		for(let ii=0;ii<iLen;++ii) {
			if(ii+1 < iLen) {
				switch (aPathElements[ii].toUpperCase()) {
					case "VENUE":
						iVenueID = parseInt(aPathElements[ii+1]);
						++ii;
						break;

					case "STATUS":
						aStatus.push(aPathElements[ii+1].toUpperCase());
						++ii;
						break;
				}
			}
		}

		OrderGetter.getAll(iVenueID, aStatus).then(aOrders => {
			response.setHeader("Content-Type", "application/json");
			response.writeHead(200);
			response.end(JSON.stringify(aOrders));
		}, (err) => {
			response.writeHead(500);
			response.end(err.message);
		})
	}
};

export default OrderGetDispatcher;
