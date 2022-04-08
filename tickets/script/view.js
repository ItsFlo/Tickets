import { addLoadListener } from "./functions.js";
import Api from "./Api.js";
import Error from "./Error.js";

const ORDER_SHOW_TIME = 4000;


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
	eventSource.addEventListener(Api.order.STATUS_PICKEDUP, deleteEventListener);
	eventSource.addEventListener(Api.order.STATUS_CANCELED, deleteEventListener);
	eventSource.addEventListener("delete", deleteEventListener);
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
		orderPrepared(order);
	} catch(err) {
		Error.show(err);
	}
}
function deleteEventListener(ev) {
	try {
		let order = JSON.parse(ev.data);
		removeOrder(order);
	} catch(err) {
		Error.show(err);
	}
}

let preparedQueue = [];
function orderPrepared(order) {
	preparedQueue.push(order);
	handlePreparedQueue();
}
let preparedQueueWaiting = false;
function handlePreparedQueue() {
	if(preparedQueueWaiting || !preparedQueue.length) {
		return;
	}
	preparedQueueWaiting = true;
	let order = preparedQueue.shift();
	let element = getOrderElement(order.id);
	orderElementSetData(element, order);
	let elementClone = element.cloneNode(true);
	let oldPosition = element.getBoundingClientRect();

	element.classList.add("hidden");
	element.classList.add("zero-width");
	setTimeout(() => insertOrderElement(element), 500);
	elementClone.classList.add("popup");
	elementClone.style.left = oldPosition.x + "px";
	elementClone.style.top = oldPosition.y + "px";
	document.body.appendChild(elementClone);
	elementClone.getBoundingClientRect();
	elementClone.classList.add("fullscreen");

	setTimeout(() => {
		if(element.parentElement) {
			let newPosition = element.getBoundingClientRect();
			elementClone.style.left = newPosition.x + "px";
			elementClone.style.top = newPosition.y + "px";
			elementClone.classList.remove("fullscreen");
			element.classList.remove("zero-width");
		}
		else {
			elementClone.style.fontSize = 0;
		}
		setTimeout(() => {
			elementClone.remove();
			element.classList.remove("hidden");
		}, 500);
		preparedQueueWaiting = false;
		handlePreparedQueue();
	}, ORDER_SHOW_TIME);
}



function getOrderTemplate() {
	let template = document.getElementById("orderTemplate");
	return template.content.firstElementChild.cloneNode(true);
}
function orderElementSetData(element, order) {
	element.dataset.id = order.id;
	element.dataset.orderNumber = order.orderNumber;
	element.dataset.status = order.status;

	element.querySelector(".order-number").textContent = order.orderNumber;
}
function insertOrderElement(orderElement) {
	let container;
	switch(orderElement.dataset.status) {
		case Api.order.STATUS_OPEN:
			container = document.querySelector("#ordered .container");
			break;

		case Api.order.STATUS_PREPARED:
			container = document.querySelector("#prepared .container");
			break;

		default:
			return;
	}
	container.appendChild(orderElement);
	orderElement.getBoundingClientRect();
	orderElement.classList.remove("scale-zero");
}
function getOrderElement(id) {
	return document.querySelector(".container .order[data-id=\"" + id + "\"]");
}
function addOrder(order) {
	let element = getOrderTemplate();
	orderElementSetData(element, order);
	insertOrderElement(element);
}
function removeOrder(order) {
	let element = getOrderElement(order.id);
	if(element) {
		element.classList.add("scale-zero");
		setTimeout(() => element.remove(), 300);
	}
}




function load(venueId) {
	let status = [
		Api.order.STATUS_OPEN,
		Api.order.STATUS_PREPARED,
	];
	openEventSource(venueId);
	return Api.order.getAll(venueId, status).then(result => {
		for(let order of result.json) {
			addOrder(order);
		}
	}, err => Error.show(err));
}



function getPathVenueName() {
	let pathsParts = window.location.pathname.split("/");
	for(let part of pathsParts) {
		if(!part) {
			continue;
		}
		return part;
	}
	return null;
}
function getVenue() {
	let searchParams = (new URL(window.location)).searchParams;
	if(searchParams.get("venue")) {
		return Api.venue.get(searchParams.get("venue"));
	}

	let venueName = getPathVenueName();
	if(venueName) {
		return Api.venue.getByName(venueName);
	}

	return Api.venue.getClosestToDate();
}
function documentLoadListener() {
	getVenue().then(result => {
		load(result.json.id);
	}, err => Error.show(err));
}
addLoadListener(documentLoadListener);
