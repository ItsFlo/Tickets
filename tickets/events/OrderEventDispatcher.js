import { sendStatus } from "../../modules/HttpDispatcher.js";
import SseDispatcher from "../../modules/SseDispatcher.js";
import Order from "../db/Order.js";
import Events from "../Events.js";

class OrderEventDispatcher extends SseDispatcher {
	moVenueConnections = [];

	constructor() {
		super();
		Events.addEventDispatcher(Order.TABLE, this);
	}

	request(sPath, request, response, ...args) {
		if(!sPath) {
			super.request(sPath, request, response, ...args);
			return;
		}

		let iVenueID = parseInt(sPath);
		if(isNaN(iVenueID)) {
			sendStatus(response, 400);
			return;
		}

		this.initConnection(response);
		response.on("close", () => {
			if(Array.isArray(this.moVenueConnections[iVenueID])) {
				let iIndex = this.moVenueConnections[iVenueID].indexOf(response);
				if(iIndex > -1) {
					this.moVenueConnections[iVenueID].splice(iIndex, 1);
				}
			}
		});

		if(Array.isArray(this.moVenueConnections[iVenueID])) {
			this.moVenueConnections[iVenueID].push(response);
		}
		else {
			this.moVenueConnections[iVenueID] = [response];
		}
	}

	closeAllConnections() {
		for(let iVenueID in this.moVenueConnections) {
			for(let oConnection of this.moVenueConnections[iVenueID]) {
				oConnection.end();
			}
			this.moVenueConnections[iVenueID] = [];
		}
		this.moVenueConnections = {};

		super.closeAllConnections();
		return this;
	}


	sendEvent(sEventName, oOrder) {
		let iVenueID = oOrder[Order.COL_VENUE];
		let sData = JSON.stringify(oOrder);

		if(Array.isArray(this.moVenueConnections[iVenueID])) {
			let sMessage = this.formatMessage(sEventName, sData);
			for(let oConnection of this.moVenueConnections[iVenueID]) {
				oConnection.write(sMessage);
			}
		}

		super.sendEvent(sEventName, sData);
	}
};

export default OrderEventDispatcher;
