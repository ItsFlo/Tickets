import TicketDispatcher from "../tickets/TicketDispatcher.js";
import { HttpDispatcherGroup } from "./HttpDispatcher.js";


let dispatchManager = new HttpDispatcherGroup(false);
dispatchManager.addDispatcher("", TicketDispatcher.ticketDispatcher);


function init() {
	TicketDispatcher.init();
}

export default {
	init,
	dispatchManager,
};
