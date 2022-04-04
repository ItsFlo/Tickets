import Api from "../Api.js";
import Error from "../Error.js";
import OrderElement from "../modules/orderElement.js";


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
	eventSource.addEventListener(Api.order.STATUS_PICKEDUP, removeOrderEventListener);
	eventSource.addEventListener(Api.order.STATUS_CANCELED, removeOrderEventListener);
	eventSource.addEventListener("delete", reload);
}

function newOrderEventListener(ev) {
	try {
		let order = JSON.parse(ev.data);
		addOrder(order);
	} catch(err) {
		Error.show(err);
	}
}
function preparedEventListener(ev) {
	try {
		let order = JSON.parse(ev.data);
		let element = getOrderElement(order.id);
		OrderElement.updateOrderData(element, order);
		insertOrderElement(element);
	} catch(err) {
		Error.show(err);
	}
}
function removeOrderEventListener(ev) {
	try {
		let order = JSON.parse(ev.data);
		let element = getOrderElement(order.id);
		if(element) {
			element.remove();
		}
	} catch(err) {
		Error.show(err);
	}
}



function preparedListener() {
	let order = this.closest(".order");
	let orderId = parseInt(order.dataset.orderId);
	if(!isNaN(orderId)) {
		Api.order.setPrepared(orderId).catch(err => Error.show(err.message));
	}
}
function pickedupListener() {
	let order = this.closest(".order");
	let orderId = parseInt(order.dataset.orderId);
	if(!isNaN(orderId)) {
		Api.order.setPickedUp(orderId).catch(err => Error.show(err.message));
	}
}
function createOrderElement(order=null) {
	let element = OrderElement.createOrderElement(order);
	element.querySelector("input.prepared").addEventListener("click", preparedListener);
	element.querySelector("input.pickedup").addEventListener("click", pickedupListener);
	return element;
}
function insertOrderElement(orderElement) {
	let container = null;
	switch(orderElement.dataset.status) {
		case Api.order.STATUS_OPEN:
			container = document.getElementById("openOrders");
			break;
		case Api.order.STATUS_PREPARED:
			container = document.getElementById("preparedOrders");
			break;
		default:
			return null;
	}
	container.appendChild(orderElement);
}
function addOrder(order) {
	let element = createOrderElement(order);
	insertOrderElement(element);
	return element;
}
function getOrderElement(orderId) {
	let container = document.getElementById("orderContainer");
	return container.querySelector(".order[data-order-id=\"" + orderId + "\"]");
}


function clear() {
	for(let id of ["openOrders", "preparedOrders"]) {
		let container = document.getElementById(id);
		while(container.firstChild) {
			container.firstChild.remove();
		}
	}
}
let currentVenueId = null;
function load(venueId) {
	currentVenueId = venueId;
	let status = [
		Api.order.STATUS_OPEN,
		Api.order.STATUS_PREPARED,
	];
	clear();
	openEventSource(venueId);
	return Api.order.getAll(venueId, status).then(result => {
		for(let order of result.json) {
			addOrder(order);
		}
	}, err => Error.show(err));
}
function reload() {
	return load(currentVenueId);
}

export default {
	clear,
	load,
	reload,
};
