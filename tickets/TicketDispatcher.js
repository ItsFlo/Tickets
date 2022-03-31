import { HttpDispatcherGroup } from "../modules/HttpDispatcher.js";
import Api from "./api/ApiDispatcher.js";
import EventDispatcher from "./events/EventDispatcher.js";
import FrontEndDispatcher from "./FrontEndDispatcher.js";

let ticketDispatcher = new HttpDispatcherGroup();
ticketDispatcher.addDispatcher("api", Api.apiDispatcher);
ticketDispatcher.addDispatcher("events", EventDispatcher.eventDispatcher);
ticketDispatcher.addDispatcher("/", FrontEndDispatcher.frontEndDispatcher);


function init() {
	Api.init();
	EventDispatcher.init();
}

export default {
	init,
	ticketDispatcher,
}
