import { sendStatus } from "../../modules/HttpDispatcher.js";
import SseDispatcher from "../../modules/SseDispatcher.js";
import Order from "../db/Order.js";
import Events from "../Events.js";

class OrderEventDispatcher extends SseDispatcher {
	venueConnections = [];

	constructor() {
		super();
		Events.addEventDispatcher(Order.TABLE, this);
	}

	request(path, request, response, ...args) {
		if(!path) {
			super.request(path, request, response, ...args);
			return;
		}

		let venueId = parseInt(path);
		if(isNaN(venueId)) {
			sendStatus(response, 400);
			return;
		}

		this.initConnection(response);
		response.on("close", () => {
			if(Array.isArray(this.venueConnections[venueId])) {
				let index = this.venueConnections[venueId].indexOf(response);
				if(index > -1) {
					this.venueConnections[venueId].splice(index, 1);
				}
			}
		});

		if(Array.isArray(this.venueConnections[venueId])) {
			this.venueConnections[venueId].push(response);
		}
		else {
			this.venueConnections[venueId] = [response];
		}
	}

	closeAllConnections() {
		for(let venueId in this.venueConnections) {
			for(let connection of this.venueConnections[venueId]) {
				connection.end();
			}
			this.venueConnections[venueId] = [];
		}
		this.venueConnections = {};

		super.closeAllConnections();
		return this;
	}


	sendEvent(eventName, order) {
		let venueId = order[Order.COL_VENUE];
		let data = JSON.stringify(order);

		if(Array.isArray(this.venueConnections[venueId])) {
			let message = this.formatMessage(eventName, data);
			for(let connection of this.venueConnections[venueId]) {
				connection.write(message);
			}
		}

		super.sendEvent(eventName, data);
	}
};

export default OrderEventDispatcher;
