import { HttpDispatcherGroup } from "../modules/HttpDispatcher.js";
import Api from "./api/ApiDispatcher.js";
import FrontEndDispatcher from "./FrontEndDispatcher.js";

let oTicketDispatcher = new HttpDispatcherGroup();
oTicketDispatcher.addDispatcher("api", Api.apiDispatcher);
oTicketDispatcher.addDispatcher("/", FrontEndDispatcher.frontEndDispatcher);


function init() {
	Api.init();
}

export default {
	init,
	ticketDispatcher: oTicketDispatcher,
}
