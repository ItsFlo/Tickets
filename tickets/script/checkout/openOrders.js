import Api from "../Api.js";
import Error from "../Error.js";

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
	oEventSource.addEventListener("DONE", orderDoneEventListener);
	oEventSource.addEventListener("PICKUP", orderPickupEventListener);
	oEventSource.addEventListener("delete", orderPickupEventListener);
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
function orderDoneEventListener(ev) {
	try {
		let oOrder = JSON.parse(ev.data);
		let oOrderElement = getOrderByID(oOrder.id);
		if(oOrderElement) {
			oOrderElement.classList.add("done");
		}
	} catch(err) {
		Error.show(err);
	}
}
function orderPickupEventListener(ev) {
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







function doneListener() {
	let oOrder = this.closest(".order");
	let iOrderID = parseInt(oOrder.dataset.orderId);
	if(isNaN(iOrderID)) {
		return;
	}

	Api.order.setDone(iOrderID).catch(err => Error.show(err.message));
}
function pickupListener() {
	let oOrder = this.closest(".order");
	let iOrderID = parseInt(oOrder.dataset.orderId);
	if(isNaN(iOrderID)) {
		return;
	}

	Api.order.setPickup(iOrderID).catch(err => Error.show(err.message));
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
function createElement(oOrder) {
	let oElement = document.createElement("div");
	oElement.classList.add("order");

	let oOrderNumber = document.createElement("div");
	oOrderNumber.classList.add("order-number");
	oElement.appendChild(oOrderNumber);

	let oDate = document.createElement("span");
	oDate.classList.add("date");
	oElement.appendChild(oDate);
	let oTime = document.createElement("span");
	oTime.classList.add("time");
	oElement.appendChild(oTime);

	let oItemContainer = document.createElement("div");
	oItemContainer.classList.add("items");
	oElement.appendChild(oItemContainer);

	let oPrice = document.createElement("span");
	oPrice.classList.add("price");
	oElement.appendChild(oPrice);


	let oDoneButton = document.createElement("input");
	oDoneButton.classList.add("done");
	oDoneButton.setAttribute("type", "button");
	oDoneButton.setAttribute("value", "abholbereit");
	oDoneButton.addEventListener("click", doneListener);
	oElement.appendChild(oDoneButton);

	let oPickupButton = document.createElement("input");
	oPickupButton.classList.add("pickup");
	oPickupButton.setAttribute("type", "button");
	oPickupButton.setAttribute("value", "abgeholt");
	oPickupButton.addEventListener("click", pickupListener);
	oElement.appendChild(oPickupButton);



	oElement.dataset.orderId = oOrder.id;
	oElement.dataset.orderNumber = oOrder.orderNumber;
	oElement.dataset.status = oOrder.status;
	oOrderNumber.innerHTML = oOrder.orderNumber;
	if(oOrder.orderTimestamp) {
		let tempDate = new Date(oOrder.orderTimestamp);
		oElement.dataset.orderTimestamp = tempDate.getTime();

		let sDateString = tempDate.getFullYear() + "-";
		if(tempDate.getMonth() < 9) {
			sDateString += "0";
		}
		sDateString += (tempDate.getMonth()+1) + "-";
		if(tempDate.getDate() < 10) {
			sDateString += "0";
		}
		sDateString += tempDate.getDate();
		oDate.innerHTML = sDateString;

		let sTimeString = tempDate.getHours() + ":";
		if(tempDate.getMinutes() < 9) {
			sTimeString += "0";
		}
		sTimeString += (tempDate.getMinutes()) + ":";
		if(tempDate.getSeconds() < 10) {
			sTimeString += "0";
		}
		sTimeString += tempDate.getSeconds();
		oTime.innerHTML = sTimeString;
	}
	for(let oItem of oOrder.items) {
		let oItemElement = createItemElement(oItem);
		oItemContainer.appendChild(oItemElement);
	}
	oPrice.innerHTML = oOrder.price.toFixed(2);

	return oElement;
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
	Api.order.getAllOpenAndDoneOrders(iVenueID).then(oResponse => {
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
