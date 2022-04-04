import Api from "../Api.js";
import Error from "../Error.js";
import OrderElement from "../modules/orderElement.js";

let oEventSource = null;



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
		let oOrderElement = createOrderElement(oOrder);
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
		OrderElement.updateOrderData(orderElement, order);
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
function createOrderElement(order=null) {
	let element = OrderElement.createOrderElement(order);
	element.querySelector("input.prepared").addEventListener("click", preparedListener);
	element.querySelector("input.pickedup").addEventListener("click", pickedUpListener);
	element.querySelector(".cancel-button").addEventListener("click", cancelListener);
	return element;
}

function getOrderByID(iOrderID) {
	return document.querySelector("#openOrders > .order[data-order-id=\""+iOrderID+"\"");
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
			let oOrderElement = createOrderElement(oOrder);
			insertElement(oOrderElement);
		}
		openEventSource(iVenueID);
	}).catch(err => Error.show(err.message));
}





export default {
	loadOrders,
};
