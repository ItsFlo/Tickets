import TicketDispatcher from "../tickets/TicketDispatcher.js";
import { HttpDispatcherGroup } from "./HttpDispatcher.js";


let oDispatchManager = new HttpDispatcherGroup(false);
oDispatchManager.addDispatcher("", TicketDispatcher.ticketDispatcher);


function init(oConfig) {
	TicketDispatcher.init(oConfig);
}

export default {
	dispatchManager: oDispatchManager,
	init,
};
