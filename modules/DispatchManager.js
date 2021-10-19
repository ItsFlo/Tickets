import TicketDispatcher from "../tickets/TicketDispatcher.js";
import { HttpDispatcherGroup } from "./HttpDispatcher.js";


let oDispatchManager = new HttpDispatcherGroup(false);
oDispatchManager.addDispatcher("", TicketDispatcher.ticketDispatcher);


function init() {
	TicketDispatcher.init();
}

export default {
	init,
	dispatchManager: oDispatchManager,
};
