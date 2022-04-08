import Api from "../Api.js";
import Error from "../Error.js";
import OrderElement from "../modules/orderElement.js";

const ORDER_CONTAINERS = ["openOrders", "preparedOrders"];


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
	filterHiddenCategoriesOfOrder(element);
	insertOrderElement(element);
	return element;
}
function updateOrder(order) {
	let element = getOrderElement(order.id);
	if(element) {
		OrderElement.updateOrderData(element, order);
		insertOrderElement(element);
	}
}
function removeOrder(order) {
	let element = getOrderElement(order.id);
	if(element) {
		element.remove();
	}
}
function getOrderElement(orderId) {
	let container = document.getElementById("orderContainer");
	return container.querySelector(".order[data-order-id=\"" + orderId + "\"]");
}

function filterHiddenCategoriesOfOrder(orderElement) {
	let hasUnhiddenChildren = false;
	let items = orderElement.querySelectorAll(".items .item");
	for(let item of items) {
		let catId = parseInt(item.dataset.categoryId);
		let catIsHidden = hiddenItemCategories.has(catId);
		item.classList.toggle("hidden", catIsHidden);
		if(!catIsHidden) {
			hasUnhiddenChildren = true;
		}
	}
	orderElement.classList.toggle("hidden", !hasUnhiddenChildren);
}
function filterHiddenCategories() {
	for(let id of ORDER_CONTAINERS) {
		let container = document.getElementById(id);
		let orders = container.querySelectorAll(".order");
		for(let order of orders) {
			filterHiddenCategoriesOfOrder(order);
		}
	}
}




let hiddenItemCategories = new Set();
function hideItemCategory(itemCatId) {
	hiddenItemCategories.add(itemCatId);
	filterHiddenCategories();
}
function unhideItemCategory(itemCatId) {
	hiddenItemCategories.delete(itemCatId);
	filterHiddenCategories();
}




function clear() {
	hiddenItemCategories.clear();
	for(let id of ORDER_CONTAINERS) {
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

	hideItemCategory,
	unhideItemCategory,

	addOrder,
	updateOrder,
	removeOrder,
};
