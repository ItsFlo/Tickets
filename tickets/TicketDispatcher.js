import { HttpDispatcherGroup } from "../modules/HttpDispatcher.js";
import Api from "./api/ApiDispatcher.js";
import EventDispatcher from "./events/EventDispatcher.js";
import FrontEndDispatcher from "./FrontEndDispatcher.js";

let oTicketDispatcher = new HttpDispatcherGroup();
oTicketDispatcher.addDispatcher("api", Api.apiDispatcher);
oTicketDispatcher.addDispatcher("events", EventDispatcher.eventDispatcher);
oTicketDispatcher.addDispatcher("/", FrontEndDispatcher.frontEndDispatcher);


function init() {
	Api.init();
	EventDispatcher.init();
}

export default {
	init,
	ticketDispatcher: oTicketDispatcher,
}
