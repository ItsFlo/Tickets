import { addLoadListener, getPathPart } from "./functions.js";
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
	let order, element;
	do {
		order = preparedQueue.shift();
		element = getOrderedOrderElement(order.id);
	} while(!element && preparedQueue.length);
	if(!element) {
		preparedQueueWaiting = false;
		return;
	}
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
			elementClone.classList.add("prepared");
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
function getOrderedOrderElement(id) {
	return document.querySelector("#ordered .container .order[data-id=\"" + id + "\"]");
}
function getPreparedOrderElement(id) {
	return document.querySelector("#prepared .container .order[data-id=\"" + id + "\"]");
}
function addOrder(order) {
	if(!orderMatchesCategories(order)) {
		return;
	}
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

function addVenueCss(venueId) {
	let cssPath = `/style/venue/${venueId}.css`;
	let element = document.createElement("link");
	element.rel = "stylesheet";
	element.type = "text/css";
	element.href = cssPath;
	document.head.appendChild(element);
	return element;
}



function getVenue() {
	let searchParams = (new URL(window.location)).searchParams;
	if(searchParams.get("venue")) {
		return Api.venue.get(searchParams.get("venue"));
	}

	let venueName = getPathPart(0);
	if(venueName) {
		return Api.venue.getByName(venueName);
	}

	return Api.venue.getClosestToDate();
}


let includedCats = new Set();
let excludedCats = new Set();
let filterCategories = false;
function orderMatchesCategories(order) {
	if(!filterCategories) {
		return true;
	}
	let cats = new Set();
	for(let item of order.items) {
		cats.add(item.itemCategory);
	}

	if(includedCats.size) {
		for(let catId of cats) {
			if(includedCats.has(catId)) {
				return true;
			}
		}
		return false;
	}
	if(excludedCats.size) {
		for(let catId of cats) {
			if(!excludedCats.has(catId)) {
				return true;
			}
		}
		return false;
	}
	return true;
}

function documentLoadListener() {
	let searchParams = (new URL(window.location)).searchParams;
	for(let catId of searchParams.getAll("include")) {
		catId = parseInt(catId);
		if(!isNaN(catId)) {
			includedCats.add(catId);
		}
	}
	for(let catId of searchParams.getAll("exclude")) {
		catId = parseInt(catId);
		if(!isNaN(catId)) {
			excludedCats.add(catId);
		}
	}
	if(includedCats.size || excludedCats.size) {
		filterCategories = true;
	}

	getVenue().then(result => {
		let venueId = result.json.id;
		addVenueCss(venueId);
		load(venueId);
	}, err => Error.show(err));
}
addLoadListener(documentLoadListener);
