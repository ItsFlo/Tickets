import Api from "../Api.js";
import Error from "../Error.js";
import VenueSelect from "./venueSelect.js"

function clearItems() {
	let oNewOrder = document.getElementById("newOrder");
	let oItemCats = oNewOrder.querySelector(".item-categories");

	while(oItemCats.firstChild) {
		oItemCats.firstChild.remove();
	}

	let oSum = oNewOrder.querySelector(".order-sum .sum");
	oSum.innerHTML = "0.00";
}
function resetItems() {
	let oNewOrder = document.getElementById("newOrder");
	let oItemCats = oNewOrder.querySelector(".item-categories");

	let aItems = oItemCats.querySelectorAll(".item");
	for(let oItem of aItems) {
		let oInput = oItem.querySelector("input");
		let oItemSum = oItem.querySelector(".sum");

		oInput.value = 0;
		oItemSum.innerHTML = "0.00";
	}

	let oSum = oNewOrder.querySelector(".order-sum .sum");
	oSum.innerHTML = "0.00";
}


function createItemCategory(oItemCategory) {
	let oElement = document.createElement("div");
	oElement.classList.add("item-category");

	let oName = document.createElement("h3");
	oName.classList.add("name");

	let oItemContainer = document.createElement("div");
	oItemContainer.classList.add("items");


	oElement.appendChild(oName);
	oElement.appendChild(oItemContainer);

	oElement.dataset.itemCategoryId = oItemCategory.id;
	oName.innerHTML = oItemCategory.name;

	Api.item.getAll(oItemCategory.id).then(oResponse => {
		let aItems = oResponse.json;
		for(let oItem of aItems) {
			let oItemElement = createItem(oItem);
			oItemContainer.appendChild(oItemElement);
		}
	}).catch(error => {
		Error.show(error);
	});

	return oElement;
}


function recalculateOrderSum() {
	let oNewOrder = document.getElementById("newOrder");
	let oOrderSum = oNewOrder.querySelector(".order-sum .sum");

	let fSum = 0;
	let aItemSums = oNewOrder.querySelectorAll(".items .item .sum");
	for(let oItemSum of aItemSums) {
		fSum += parseFloat(oItemSum.textContent) ?? 0;
	}

	oOrderSum.innerHTML = fSum.toFixed(2);
}
function recalculateItemPrice(oItem) {
	let oInput = oItem.querySelector("input");
	let iCount = parseInt(oInput.value) ?? 0;
	let fItemPrice = parseFloat(oItem.dataset.price) ?? 0;

	let oSum = oItem.querySelector(".count .sum");
	oSum.innerHTML = (fItemPrice * iCount).toFixed(2);

	recalculateOrderSum();
}
function plusListener(ev) {
	ev.preventDefault();
	let oInput = this.parentNode.querySelector("input");
	let fCurPrice = parseFloat(oInput.value) ?? 0;
	++fCurPrice;
	oInput.value = fCurPrice;

	let oItem = oInput.closest(".item");
	recalculateItemPrice(oItem);
}
function minusListener(ev) {
	ev.preventDefault();
	let oInput = this.parentNode.querySelector("input");
	let fCurPrice = parseFloat(oInput.value) ?? 0;
	if(fCurPrice > 0) {
		--fCurPrice;
	}
	oInput.value = fCurPrice;

	let oItem = oInput.closest(".item");
	recalculateItemPrice(oItem);
}
function inputListener() {
	let iValue = parseInt(this.value);
	if(iValue < 0) {
		iValue = 0;
	}
	this.value = iValue;
	let oItem = this.closest(".item");
	recalculateItemPrice(oItem);
}
function dblclickListener(ev) {
	ev.preventDefault();
}
function createItem(oItem) {
	let oElement = document.createElement("div");
	oElement.classList.add("item");

	let oName = document.createElement("span");
	oName.classList.add("name");

	let oPrice = document.createElement("span");
	oPrice.classList.add("price");
	oPrice.innerHTML = oItem.price.toFixed(2);

	let oDots = document.createElement("span");
	oDots.classList.add("dots");

	let oCount = document.createElement("div");
	oCount.classList.add("count");

	let oCountInput = document.createElement("input");
	oCountInput.setAttribute("type", "number");
	oCountInput.setAttribute("min", "0");
	oCountInput.setAttribute("step", "1");
	oCountInput.setAttribute("value", "0");
	oCountInput.setAttribute("required", "required");
	oCountInput.addEventListener("change", inputListener);

	let oPlusButton = document.createElement("span");
	oPlusButton.classList.add("button");
	oPlusButton.classList.add("plus");
	oPlusButton.addEventListener("click", plusListener);
	oPlusButton.addEventListener("dblclick", dblclickListener);
	let oMinusButton = document.createElement("span");
	oMinusButton.classList.add("button");
	oMinusButton.classList.add("minus");
	oMinusButton.addEventListener("click", minusListener);
	oMinusButton.addEventListener("dblclick", dblclickListener);

	let oSum = document.createElement("span");
	oSum.classList.add("sum");
	oSum.innerHTML = "0.00";

	oCount.appendChild(oMinusButton);
	oCount.appendChild(oCountInput);
	oCount.appendChild(oPlusButton);
	oCount.appendChild(oSum);



	oElement.appendChild(oName);
	oElement.appendChild(oPrice);
	oElement.appendChild(oDots);
	oElement.appendChild(oCount);

	oElement.dataset.itemId = oItem.id;
	oElement.dataset.price = oItem.price;
	oName.innerHTML = oItem.name;

	return oElement;
}

function loadItemCategories(iVenueID) {
	clearItems();

	Api.itemCategory.getAll(iVenueID).then(oResponse => {
		let oNewOrder = document.getElementById("newOrder");
		let oItemCats = oNewOrder.querySelector(".item-categories");

		let aItemCategories = oResponse.json;
		for(let oItemCategory of aItemCategories) {
			let oItemCategoryElement = createItemCategory(oItemCategory);
			oItemCats.appendChild(oItemCategoryElement);
		}
	}).catch(error => {
		Error.show(error);
	});
}




function getItems() {
	let aItems = [];

	let oOrderContainer = document.querySelector("#newOrder .item-categories");
	let oItemElements = oOrderContainer.querySelectorAll(".item");
	for(let oItem of oItemElements) {
		let iItemID = parseInt(oItem.dataset.itemId);
		let iCount = parseInt(oItem.querySelector("input").value);
		if(!isNaN(iItemID) && !isNaN(iCount) && iCount > 0) {
			aItems.push({
				id: iItemID,
				count: iCount,
			});
		}
	}

	return aItems;
}

function submitOrderListener() {
	let iVenueID = VenueSelect.getSelectedID();
	let aItems = getItems();
	if(!aItems.length) {
		return;
	}

	Api.order.create(iVenueID, aItems).then(oResponse => {
		resetItems();
	}).catch(error => {
		Error.show(error);
	});
}


function init() {
	document.querySelector("#newOrder > .order-sum input").addEventListener("click", submitOrderListener);
}


export default {
	init,

	clearItems,
	loadItemCategories,
};
