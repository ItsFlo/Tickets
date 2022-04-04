import Api from "../Api.js";
import Error from "../Error.js";

const ID = "ItemList";


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
	eventSource.addEventListener(Api.order.STATUS_PREPARED, removeOrderEventListener);
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
function removeOrderEventListener(ev) {
	try {
		let order = JSON.parse(ev.data);
		removeOrder(order);
	} catch(err) {
		Error.show(err);
	}
}



function clearItemCategories() {
	let itemCategoryContainer = document.getElementById(ID).querySelector(".item-category-container");
	while(itemCategoryContainer.firstChild) {
		itemCategoryContainer.firstChild.remove();
	}
}


function getItemCategoryElementTemplate() {
	let template = document.getElementById("itemCategoryTemplate");
	let element = template.content.firstElementChild.cloneNode(true);
	return element;
}
function itemCategoryElementAddData(element, itemCategory) {
	element.dataset.id = itemCategory.id;
	element.querySelector(".name").textContent = itemCategory.name;
}
function getItemCategory(itemCategoryId) {
	let itemCategoryContainer = document.getElementById(ID).querySelector(".item-category-container");
	return itemCategoryContainer.querySelector(".item-category[data-id=\"" + itemCategoryId + "\"]");
}

function getItemElementTemplate() {
	let template = document.getElementById("itemTemplate");
	let element = template.content.firstElementChild.cloneNode(true);
	return element;
}
function itemElementAddData(element, item) {
	element.dataset.id = item.id;
	element.querySelector(".name").textContent = item.name;
	element.querySelector(".count").textContent = item.count;
}
function itemElementAddToCategory(itemCategoryId, itemElement) {
	let itemCategory = getItemCategory(itemCategoryId);
	if(!itemCategory) {
		return;
	}
	itemCategory.querySelector(".item-table").tBodies[0].appendChild(itemElement);
}
function getItem(itemId) {
	let itemCategoryContainer = document.getElementById(ID).querySelector(".item-category-container");
	return itemCategoryContainer.querySelector(".item[data-id=\"" + itemId + "\"]");
}



function addOrder(order) {
	for(let item of order.items) {
		addOrderItem(item);
	}
}
function addOrderItem(item) {
	let itemElement = getItem(item.id);
	if(itemElement) {
		let itemCount = itemElement.querySelector(".count");
		let count = parseInt(itemCount.textContent);
		itemCount.textContent = count + item.count;
	}
	else {
		itemElement = getItemElementTemplate();
		itemElementAddData(itemElement, item);
		itemElementAddToCategory(item.itemCategory, itemElement);
	}
}

function removeOrder(order) {
	for(let item of order.items) {
		removeOrderItem(item);
	}
}
function removeOrderItem(item) {
	let itemElement = getItem(item.id);
	if(itemElement) {
		let itemCount = itemElement.querySelector(".count");
		let count = parseInt(itemCount.textContent);
		count -= item.count;
		if(count < 0) {
			count = 0;
		}
		itemCount.textContent = count;
	}
}



function loadItemCategories(venueId) {
	clearItemCategories();
	return Api.itemCategory.getAll(venueId).then(result => {
		let itemCatContainer = document.getElementById(ID).querySelector(".item-category-container");
		for(let itemCat of result.json) {
			let element = getItemCategoryElementTemplate();
			itemCategoryElementAddData(element, itemCat);
			itemCatContainer.appendChild(element);
		}
	});
}


function clear() {
	clearItemCategories();
}
let currentVenueId = null;
function load(venueId) {
	currentVenueId = venueId;
	let status = [
		Api.order.STATUS_OPEN,
	];
	openEventSource(venueId);
	return loadItemCategories(venueId).then(() => {
		return Api.orderItem.getAllForVenue(venueId, status).then(result => {
			for(let item of result.json) {
				let element = getItemElementTemplate();
				itemElementAddData(element, item);
				itemElementAddToCategory(item.itemCategory, element);
			}
		});
	}).catch(err => Error.show(err));
}
function reload() {
	return load(currentVenueId);
}

export default {
	clear,
	load,
	reload,
};
