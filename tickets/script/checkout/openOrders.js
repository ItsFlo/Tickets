import Api from "../Api.js";
import Error from "../Error.js";

let oEventSource = null;

function formatDate(date) {
	let dateString = date.getFullYear() + "-";
	if(date.getMonth() < 9) {
		dateString += "0";
	}
	dateString += (date.getMonth()+1) + "-";
	if(date.getDate() < 10) {
		dateString += "0";
	}
	dateString += date.getDate();
	return dateString;
}
function formatTime(date) {
	let sTimeString = date.getHours() + ":";
	if(date.getMinutes() < 10) {
		sTimeString += "0";
	}
	sTimeString += date.getMinutes() + ":";
	if(date.getSeconds() < 10) {
		sTimeString += "0";
	}
	sTimeString += date.getSeconds();
	return sTimeString;
}



function closeEventSource() {
	if(oEventSource) {
		oEventSource.close();
		oEventSource = null;
	}
}
function openEventSource(iVenueID) {
	if(oEventSource) {
		closeEventSource();
	}
	oEventSource = new EventSource("/events/orders/"+iVenueID);

	oEventSource.addEventListener("create", newOrderEventListener);
	oEventSource.addEventListener(Api.order.STATUS_PREPARED, orderPreparedEventListener);
	oEventSource.addEventListener(Api.order.STATUS_PICKEDUP, orderPickedUpEventListener);
	oEventSource.addEventListener(Api.order.STATUS_CANCELED, orderCancelEventListener);
	oEventSource.addEventListener("delete", orderPickedUpEventListener);
}


function newOrderEventListener(ev) {
	try {
		let oOrder = JSON.parse(ev.data);
		let oOrderElement = createElement(oOrder);
		insertElement(oOrderElement);
	} catch(err) {
		Error.show(err);
	}
}
function orderPreparedEventListener(ev) {
	try {
		let oOrder = JSON.parse(ev.data);
		let oOrderElement = getOrderByID(oOrder.id);
		if(oOrderElement) {
			oOrderElement.classList.add("prepared");
		}
	} catch(err) {
		Error.show(err);
	}
}
function orderPickedUpEventListener(ev) {
	try {
		let oOrder = JSON.parse(ev.data);
		let oOrderElement = getOrderByID(oOrder.id);
		if(oOrderElement) {
			oOrderElement.remove();
		}
	} catch(err) {
		Error.show(err);
	}
}
function orderCancelEventListener(ev) {
	try {
		let order = JSON.parse(ev.data);
		let orderElement = getOrderByID(order.id);
		updateOrderElementMetaData(orderElement, order);
	} catch(err) {
		Error.show(err);
	}
}







function preparedListener() {
	let oOrder = this.closest(".order");
	let iOrderID = parseInt(oOrder.dataset.orderId);
	if(isNaN(iOrderID)) {
		return;
	}

	Api.order.setPrepared(iOrderID).catch(err => Error.show(err.message));
}
function pickedUpListener() {
	let oOrder = this.closest(".order");
	let iOrderID = parseInt(oOrder.dataset.orderId);
	if(isNaN(iOrderID)) {
		return;
	}

	Api.order.setPickedUp(iOrderID).catch(err => Error.show(err.message));
}

function cancelListener() {
	let order = this.closest(".order");
	let orderId = parseInt(order.dataset.orderId);
	let status = order.dataset.status;

	let cancelableStatus = [
		Api.order.STATUS_OPEN,
		Api.order.STATUS_PREPARED,
	];
	if(cancelableStatus.includes(status)) {
		Api.order.cancel(orderId).catch(err => Error.show(err.message));
	}
	else {
		order.remove();
	}
}

function getOrderByID(iOrderID) {
	return document.querySelector("#openOrders > .order[data-order-id=\""+iOrderID+"\"");
}


function createItemElement(oItem) {
	let oElement = document.createElement("div");
	oElement.classList.add("item");

	let oCount = document.createElement("span");
	oCount.innerHTML = oItem.count + "x ";
	oElement.appendChild(oCount);

	let oName = document.createElement("span");
	oName.innerHTML = oItem.name;
	oElement.appendChild(oName);

	return oElement;
}

let template = null;
function getTemplate() {
	if(!template) {
		template = document.getElementById("orderTemplate").content.firstElementChild;
	}
	return template.cloneNode(true);
}
function createElement(order) {
	let element = getTemplate();

	let preparedButton = element.querySelector("input.prepared");
	preparedButton.addEventListener("click", preparedListener);

	let pickedUpButton = element.querySelector("input.pickedup");
	pickedUpButton.addEventListener("click", pickedUpListener);

	let cancelButton = element.querySelector(".cancel-button");
	cancelButton.addEventListener("click", cancelListener);


	updateOrderElementMetaData(element, order);
	let itemContainer = element.querySelector(".items");
	for(let item of order.items) {
		let itemElement = createItemElement(item);
		itemContainer.appendChild(itemElement);
	}

	return element;
}
function updateOrderElementMetaData(element, order) {
	element.dataset.orderId = order.id;
	element.dataset.orderNumber = order.orderNumber;
	element.dataset.status = order.status;

	if(order.status === Api.order.STATUS_PREPARED) {
		element.classList.add("prepared");
		element.classList.remove("canceled");
	}
	let cancelButton = element.querySelector(".cancel-button");
	if(order.status === Api.order.STATUS_CANCELED) {
		element.classList.remove("prepared");
		element.classList.add("canceled");
		cancelButton.title = "ausblenden";
	}
	else {
		cancelButton.title = "stornieren";
	}

	element.querySelector(".order-number").textContent = order.orderNumber;
	if(order.orderTimestamp) {
		let tempDate = new Date(order.orderTimestamp);
		element.dataset.orderTimestamp = tempDate.getTime();
		element.querySelector(".date").textContent = formatDate(tempDate);
		element.querySelector(".time").textContent = formatTime(tempDate);
	}
	element.querySelector(".price").textContent = order.price.toFixed(2);
}

function insertElement(oOrderElement) {
	let oOpenOrders = document.getElementById("openOrders");
	oOpenOrders.appendChild(oOrderElement);
}




function clearItems() {
	let oOpenOrders = document.getElementById("openOrders");
	while(oOpenOrders.firstChild) {
		oOpenOrders.firstChild.remove();
	}
}

function loadOrders(iVenueID) {
	closeEventSource();

	clearItems();
	let status = [
		Api.order.STATUS_OPEN,
		Api.order.STATUS_PREPARED,
	]
	Api.order.getAll(iVenueID, status).then(oResponse => {
		for(let oOrder of oResponse.json) {
			let oOrderElement = createElement(oOrder);
			insertElement(oOrderElement);
		}
		openEventSource(iVenueID);
	}).catch(err => Error.show(err.message));
}





export default {
	loadOrders,
};
