import venueSelect from "./modules/venueSelect.js";
import { addLoadListener, getPathPart } from "./functions.js";
import Api from "./Api.js";
import Error from "./Error.js";

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

	eventSource.addEventListener(Api.order.STATUS_PICKEDUP, pickedupEventListener);
}

function pickedupEventListener(ev) {
	try {
		let order = JSON.parse(ev.data);
		addOrder(order);
	} catch(err) {
		Error.show(err);
	}
}




function clearItemLineupTable() {
	let tableBody = document.getElementById("itemLineupTable").tBodies[0];
	while(tableBody.firstElementChild) {
		tableBody.firstElementChild.remove();
	}
}



function getItemCategoryRowTemplate(itemCat) {
	let row = document.getElementById("categoryRowTemplate").content.firstElementChild.cloneNode(true);
	row.dataset.id = itemCat.id;
	row.querySelector(".name").textContent = itemCat.name;
	row.querySelector(".count").textContent = itemCat.count;
	row.querySelector(".price-sum").textContent = itemCat.sum.toFixed(2);
	return row;
}
function getItemRowTemplate(item) {
	let row = document.getElementById("itemRowTemplate").content.firstElementChild.cloneNode(true);
	row.dataset.id = item.id;
	row.dataset.categoryId = item.itemCategory;
	row.querySelector(".name").textContent = item.name;
	row.querySelector(".price").textContent = item.price.toFixed(2);
	row.querySelector(".count").textContent = item.count;
	row.querySelector(".price-sum").textContent = item.sum.toFixed(2);
	return row;
}
async function loadCallback(result) {
	let table = document.getElementById("itemLineupTable");
	let tableBody = table.tBodies[0];
	let priceSum = 0;
	for(let itemCat of result.json) {
		priceSum += itemCat.sum;

		let categoryRow = getItemCategoryRowTemplate(itemCat);
		tableBody.appendChild(categoryRow);
		let itemResult = await Api.stats.item(null, itemCat.id);
		for(let item of itemResult.json) {
			let row = getItemRowTemplate(item);
			tableBody.appendChild(row);
		}
	}
	getVenueSumCell().textContent = priceSum.toFixed(2);
}
function load(venueId) {
	clearItemLineupTable();
	return Api.stats.itemCategory(venueId).then(loadCallback);
}


function getItemCategoryRow(id) {
	return document.getElementById("itemLineupTable").querySelector("tr.item-category[data-id=\"" + id + "\"]");
}
function getItemRow(id) {
	return document.getElementById("itemLineupTable").querySelector("tr.item[data-id=\"" + id + "\"]");
}
function getVenueSumCell() {
	return document.getElementById("itemLineupTable").tBodies[1].querySelector(".venue-sum");
}
function addOrder(order) {
	let total = 0;
	for(let item of order.items) {
		let priceSum = item.count * item.price;
		total += priceSum;

		let categoryRow = getItemCategoryRow(item.itemCategory);
		if(categoryRow) {
			let categoryCount = categoryRow.querySelector(".count");
			categoryCount.textContent = parseInt(categoryCount.textContent) + item.count;
			let categoryPrice = categoryRow.querySelector(".price-sum");
			categoryPrice.textContent = (parseFloat(categoryPrice.textContent) + priceSum).toFixed(2);
		}

		let itemRow = getItemRow(item.id);
		if(itemRow) {
			let itemCount = itemRow.querySelector(".count");
			itemCount.textContent = parseInt(itemCount.textContent) + item.count;
			let itemPrice = itemRow.querySelector(".price-sum");
			itemPrice.textContent = (parseFloat(itemPrice.textContent) + priceSum).toFixed(2);
		}
	}

	let venueSum = getVenueSumCell();
	venueSum.textContent = (parseFloat(venueSum.textContent) + total).toFixed(2);
}


function documentLoadListener() {
	venueSelect.addListener(() => {
		let venueId = venueSelect.getSelectedID();
		if(venueId === null) {
			closeEventSource();
		}
		else {
			openEventSource(venueId);
			load(venueId);
		}
	});

	let initialVenueName = getPathPart(1);
	venueSelect.init(initialVenueName);
}
addLoadListener(documentLoadListener);
