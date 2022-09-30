import Api from "../Api.js";
import Error from "../Error.js";

const ID = "ItemList";


function clearItemCategories() {
	let itemList = document.getElementById(ID);
	while(itemList.firstChild) {
		itemList.firstChild.remove();
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
	let itemList = document.getElementById(ID);
	return itemList.querySelector(".item-category[data-id=\"" + itemCategoryId + "\"]");
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
	let itemList = document.getElementById(ID);
	return itemList.querySelector(".item[data-id=\"" + itemId + "\"]");
}
function getAllItems() {
	let itemList = document.getElementById(ID);
	return itemList.querySelectorAll(".item");
}

function hideItemCategory(itemCatId) {
	let itemCatElement = getItemCategory(itemCatId);
	if(itemCatElement) {
		itemCatElement.classList.add("hidden");
	}
}
function unhideItemCategory(itemCatId) {
	let itemCatElement = getItemCategory(itemCatId);
	if(itemCatElement) {
		itemCatElement.classList.remove("hidden");
	}
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
		let itemList = document.getElementById(ID);
		for(let itemCat of result.json) {
			let element = getItemCategoryElementTemplate();
			itemCategoryElementAddData(element, itemCat);
			itemList.appendChild(element);
		}
	});
}


function clear() {
	clearItemCategories();
}
function resetItemCounts() {
	for(let item of getAllItems()) {
		let count = item.querySelector(".count");
		count.textContent = "0";
	}
}

let currentVenueId = null;
function load(venueId) {
	currentVenueId = venueId;
	let status = [
		Api.order.STATUS_OPEN,
	];
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

	hideItemCategory,
	unhideItemCategory,

	addOrder,
	removeOrder,
	resetItemCounts,
};
