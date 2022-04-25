import Api from "../Api.js";
import { formatDate, formatTime } from "../functions.js";

function createOrderElement(order=null) {
	let element = document.createElement("div");
	element.classList.add("order");

	let orderNumber = document.createElement("div");
	orderNumber.classList.add("order-number");
	element.appendChild(orderNumber);

	let date = document.createElement("span");
	date.classList.add("date");
	let time = document.createElement("span");
	time.classList.add("time");
	element.appendChild(date);
	element.appendChild(time);

	let itemContainer = document.createElement("div");
	itemContainer.classList.add("items");
	element.appendChild(itemContainer);

	let price = document.createElement("span");
	price.classList.add("price");
	element.appendChild(price);

	let buttons = {
		prepared: "abholbereit",
		pickedup: "abgeholt",
	};
	for(let className in buttons) {
		let button = document.createElement("input");
		button.classList.add(className);
		button.type = "button";
		button.value = buttons[className];
		element.appendChild(button);
	}
	let cancelButton = document.createElement("div");
	cancelButton.classList.add("cancel-button");
	cancelButton.title = "stornieren";
	element.appendChild(cancelButton);


	if(order) {
		updateOrderData(element, order);
		for(let item of order.items) {
			let itemElement = createItemElement(item);
			itemContainer.appendChild(itemElement);
		}
	}
	return element;
}
function updateOrderData(element, order) {
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
		let tempDate = new Date(order.orderTimestamp*1000);
		element.dataset.orderTimestamp = tempDate.getTime();
		element.querySelector(".date").textContent = formatDate(tempDate);
		element.querySelector(".time").textContent = formatTime(tempDate);
	}
	element.querySelector(".price").textContent = order.price.toFixed(2);
}


function createItemElement(item=null) {
	let element = document.createElement("div");
	element.classList.add("item");

	let count = document.createElement("span");
	count.classList.add("count");
	element.appendChild(count);

	let name = document.createElement("span");
	name.classList.add("name");
	element.appendChild(name);

	if(item) {
		updateItemData(element, item);
	}
	return element;
}
function updateItemData(element, item) {
	element.dataset.id = item.id;
	element.dataset.categoryId = item.itemCategory;
	element.querySelector(".count").textContent = item.count;
	element.querySelector(".name").textContent = item.name;
}

export default {
	createOrderElement,
	updateOrderData,

	createItemElement,
	updateItemData,
};
