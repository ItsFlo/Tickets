import VenueSelect from "./modules/venueSelect.js";
import { addLoadListener, getPathPart } from "./functions.js";
import CategoryFilter from "./kitchen/CategoryFilter.js";
import ItemList from "./kitchen/ItemList.js";
import OpenOrders from "./kitchen/OpenOrders.js";
import Api from "./Api.js";
import Error from "./Error.js";

let eventSource = null;
function closeEventSource() {
	if(eventSource) {
		eventSource.close();
		eventSource = null;
	}
}
function openEventSource(venueId) {
	if(eventSource) {
		closeEventSource();
	}
	eventSource = new EventSource("/events/orders/"+venueId);

	eventSource.addEventListener("create", newOrderEventListener);
	eventSource.addEventListener(Api.order.STATUS_PREPARED, preparedEventListener);
	eventSource.addEventListener(Api.order.STATUS_PICKEDUP, pickedupEventListener);
	eventSource.addEventListener(Api.order.STATUS_CANCELED, cancelEventListener);
	eventSource.addEventListener("delete", deleteEventListener);
	eventSource.addEventListener("clearOrders", clearOrdersEventListener);
}

function newOrderEventListener(ev) {
	try {
		let order = JSON.parse(ev.data);
		ItemList.addOrder(order);
		OpenOrders.addOrder(order);
	} catch(err) {
		Error.show(err);
	}
}
function preparedEventListener(ev) {
	try {
		let order = JSON.parse(ev.data);
		ItemList.removeOrder(order);
		OpenOrders.updateOrder(order);
	} catch(err) {
		Error.show(err);
	}
}
function pickedupEventListener(ev) {
	try {
		let order = JSON.parse(ev.data);
		OpenOrders.removeOrder(order);
	} catch(err) {
		Error.show(err);
	}
}
function cancelEventListener(ev) {
	try {
		let order = JSON.parse(ev.data);
		ItemList.removeOrder(order);
		OpenOrders.removeOrder(order);
	} catch(err) {
		Error.show(err);
	}
}
function deleteEventListener(ev) {
	try {
		let order = JSON.parse(ev);
		ItemList.reload();
		OpenOrders.removeOrder(order);
	} catch(err) {
		Error.show(err);
	}
}
function clearOrdersEventListener(ev) {
	OpenOrders.clear();
	ItemList.resetItemCounts();
}


function filterListener(catId, checked) {
	if(checked) {
		ItemList.unhideItemCategory(catId);
		OpenOrders.unhideItemCategory(catId);
	}
	else {
		ItemList.hideItemCategory(catId);
		OpenOrders.hideItemCategory(catId);
	}
}
CategoryFilter.addListener(filterListener);



function documentLoadListener() {
	VenueSelect.addListener(() => {
		let venueId = VenueSelect.getSelectedID();
		if(isNaN(venueId)) {
			closeEventSource();
			CategoryFilter.clear();
			ItemList.clear();
			OpenOrders.clear();
		}
		else {
			openEventSource(venueId);
			CategoryFilter.load(venueId);
			ItemList.load(venueId);
			OpenOrders.load(venueId);
		}
	});

	let initialVenueName = getPathPart(1);
	VenueSelect.init(initialVenueName);
}
addLoadListener(documentLoadListener);
