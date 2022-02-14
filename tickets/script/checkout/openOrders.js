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
	oEventSource.addEventListener(Api.order.STATUS_PREPARED, orderPreparedEventListener);
	oEventSource.addEventListener(Api.order.STATUS_PICKEDUP, orderPickedUpEventListener);
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


	let oPreparedButton = document.createElement("input");
	oPreparedButton.classList.add("prepared");
	oPreparedButton.setAttribute("type", "button");
	oPreparedButton.setAttribute("value", "abholbereit");
	oPreparedButton.addEventListener("click", preparedListener);
	oElement.appendChild(oPreparedButton);

	let oPickedUpButton = document.createElement("input");
	oPickedUpButton.classList.add("pickedup");
	oPickedUpButton.setAttribute("type", "button");
	oPickedUpButton.setAttribute("value", "abgeholt");
	oPickedUpButton.addEventListener("click", pickedUpListener);
	oElement.appendChild(oPickedUpButton);



	oElement.dataset.orderId = oOrder.id;
	oElement.dataset.orderNumber = oOrder.orderNumber;
	oElement.dataset.status = oOrder.status;
	if(oOrder.status === Api.order.STATUS_PREPARED) {
		oElement.classList.add("prepared");
	}
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
