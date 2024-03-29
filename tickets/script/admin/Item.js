import Api from '../Api.js';
import Error from '../Error.js';
import Venue from './Venue.js';
import VenueEditor from './VenueEditor.js';
import ItemCategory from './ItemCategory.js';
import { SORT_ASC, insertSorted } from '../functions.js';

let iCurrentVenueId = null;

function clearNewItemForm() {
	ItemCategory.clearSelect();

	let oNameInput = document.getElementById("newItemName");
	let oPriceInput = document.getElementById("newItemPrice");

	oNameInput.value = "";
	oPriceInput.value = "";
}


function newItemListener(ev) {
	ev.preventDefault();
	if(!VenueEditor.isOpen()) {
		return;
	}

	let iItemCategoryID = parseInt(document.getElementById("newItemCategory").value);
	if(isNaN(iItemCategoryID)) {
		return;
	}
	let oNameInput = document.getElementById("newItemName");

	let sName = oNameInput.value;
	let fPrice = document.getElementById("newItemPrice").value;

	Api.item.create(iItemCategoryID, sName, fPrice).then((oResponse) => {
		let iID = oResponse.json.id;
		let oItemElement = createElement({
			id: iID,
			itemCategory: iItemCategoryID,
			name: sName,
			price: fPrice,
		});
		insertElement(oItemElement);

		Venue.incrementItemCount(iCurrentVenueId);

		oNameInput.focus();
		oNameInput.select();
	}).catch((error) => {
		Error.show(error);
	});
}


function clear() {
	let oItemContainer = document.getElementById("itemContainer");
	while(oItemContainer.firstChild) {
		oItemContainer.firstChild.remove();
	}
	clearNewItemForm();
	iCurrentVenueId = null;
}


async function loadVenue(iVenueId) {
	iVenueId = parseInt(iVenueId);
	if(isNaN(iVenueId)) {
		clear();
		return;
	}

	if(iVenueId != iCurrentVenueId) {
		clear();
		await ItemCategory.loadItemCategories(iVenueId);
		iCurrentVenueId = iVenueId;

		let aPromises = [];
		let aItemCategories = ItemCategory.getAllElements();
		for(let oItemCategoryElement of aItemCategories) {
			let oPromise = loadItemsForCategory(oItemCategoryElement);
			if(oPromise) {
				aPromises.push(oPromise);
			}
		}

		await Promise.all(aPromises);
		updateItemCount();
	}
}


function updateVenueName() {
	if(!VenueEditor.isOpen()) {
		return;
	}
	let oItemEditor = document.getElementById("itemEditor");

	if(iCurrentVenueId === null) {
		return;
	}
	let oVenue = Venue.getElement(iCurrentVenueId);
	if(oVenue) {
		oItemEditor.querySelector(".venueName .name").textContent = oVenue.querySelector(".name:not(input)").textContent.trim();
		oItemEditor.querySelector(".venueName .id").textContent = iCurrentVenueId;
	}
}
function updateItemCount() {
	if(!VenueEditor.isOpen()) {
		return;
	}
	let oItemEditor = document.getElementById("itemEditor");

	if(iCurrentVenueId === null) {
		return;
	}
	let oVenue = Venue.getElement(iCurrentVenueId);
	if(!oVenue) {
		return;
	}

	let aItems = oItemEditor.querySelectorAll(".itemContainer .item-table .item");
	let iItemCount = aItems.length;
	Venue.updateItemCount(iCurrentVenueId, iItemCount);
}




function saveEditListener(ev) {
	ev.preventDefault();
	let oItem = this.closest(".item");
	let iID = parseInt(oItem.dataset.itemId);
	if(isNaN(iID)) {
		abortEditItem(oItem);
		return;
	}

	let sNewName = oItem.querySelector(".name.edit input").value.trim();
	let fNewPrice = parseFloat(oItem.querySelector(".price.edit input").value);

	let oOldName = oItem.querySelector(".name:not(.edit)");
	let oOldPrice = oItem.querySelector(".price:not(.edit)");

	let bChanges = false;
	let bReInsert = false;
	if(sNewName !== oOldName.textContent.trim()) {
		bChanges = true;
		bReInsert = true;
	}
	else {
		sNewName = null;
	}

	if(fNewPrice !== parseFloat(oOldPrice.textContent)) {
		bChanges = true;
	}
	else {
		fNewPrice = null;
	}

	if(bChanges) {
		Api.item.update(iID, sNewName, fNewPrice).then(() => {
			if(sNewName) {
				oOldName.textContent = sNewName;
			}
			if(fNewPrice !== null) {
				oOldPrice.textContent = fNewPrice.toFixed(2) + " €";
			}
			abortEditItem(oItem);
			if(bReInsert) {
				insertElement(oItem);
			}
		}).catch((error) => {
			Error.show(error);
			abortEditItem(oItem);
		});
	}
	else {
		abortEditItem(oItem);
	}
}
function abortEditListener(ev) {
	let oItem = this.closest(".item");
	abortEditItem(oItem);
}

function editEscapeKeyListener(ev) {
	if(ev.key === "Escape") {
		ev.stopPropagation();
		let oItem = this.closest(".item");
		abortEditItem(oItem);
	}
}


function editItem(oItem) {
	if(oItem.classList.contains("edit")) {
		return;
	}
	let oName = oItem.querySelector(".name");
	let iItemID = parseInt(oItem.dataset.itemId);
	let sFormID = "editItemForm_" + iItemID;

	let oDoneButtonCell = document.createElement("td");
	oDoneButtonCell.classList.add("button");
	oDoneButtonCell.classList.add("edit");
	let oDoneButton = document.createElement("button");
	oDoneButton.setAttribute("type", "submit");
	oDoneButton.setAttribute("form", sFormID);
	oDoneButtonCell.appendChild(oDoneButton);
	let oDoneButtonIcon = document.createElement("img");
	oDoneButtonIcon.setAttribute("src", "/image/done_icon.svg");
	oDoneButtonIcon.setAttribute("height", "100%");
	oDoneButton.appendChild(oDoneButtonIcon);

	let oClearButtonCell = document.createElement("td");
	oClearButtonCell.classList.add("button");
	oClearButtonCell.classList.add("edit");
	let oClearButton = document.createElement("img");
	oClearButton.setAttribute("src", "/image/clear_icon.svg");
	oClearButton.addEventListener("click", abortEditListener);
	oClearButtonCell.appendChild(oClearButton);


	let oForm = document.createElement("form");
	oForm.id = sFormID;
	oForm.addEventListener("submit", saveEditListener);


	let oNameCell = document.createElement("td");
	oNameCell.classList.add("name");
	oNameCell.classList.add("edit");
	let oNameInput = document.createElement("input");
	oNameInput.setAttribute("type", "text");
	oNameInput.setAttribute("required", "required");
	oNameInput.setAttribute("placeholder", "Name");
	oNameInput.setAttribute("form", sFormID);
	oNameInput.value = oName.textContent.trim();
	oNameInput.addEventListener("keyup", editEscapeKeyListener);
	oNameCell.appendChild(oNameInput);

	let oPriceCell = document.createElement("td");
	oPriceCell.classList.add("price");
	oPriceCell.classList.add("edit");
	let oPriceInput = document.createElement("input");
	oPriceInput.setAttribute("type", "number");
	oPriceInput.setAttribute("min", "0");
	oPriceInput.setAttribute("step", "0.01");
	oPriceInput.setAttribute("required", "required");
	oPriceInput.setAttribute("placeholder", "Preis");
	oPriceInput.setAttribute("form", sFormID);
	oPriceInput.value = parseFloat(oItem.querySelector(".price").textContent);
	oPriceInput.addEventListener("keyup", editEscapeKeyListener);
	oPriceCell.appendChild(oPriceInput);

	oItem.insertBefore(oDoneButtonCell, oName);
	oItem.insertBefore(oClearButtonCell, oName);
	oItem.insertBefore(oForm, oName);
	oItem.insertBefore(oNameCell, oName);
	oItem.insertBefore(oPriceCell, oName);
	oItem.classList.add("edit");

	oNameInput.focus();
	oNameInput.select();
}
function abortEditItem(oItem) {
	let aButtons = Array.from(oItem.querySelectorAll(".button.edit"));
	for(let oButton of aButtons) {
		oButton.remove();
	}

	let oForm = oItem.querySelector("form");
	if(oForm) {
		oForm.remove();
	}

	let aEditCells = Array.from(oItem.querySelectorAll("td.edit"));
	for(let oEditCell of aEditCells) {
		oEditCell.remove();
	}

	oItem.classList.remove("edit");
}



function editListener(ev) {
	ev.stopPropagation();
	let oItem = this.closest(".item");

	editItem(oItem);
}

function deleteListener(ev) {
	ev.stopPropagation();
	let oItem = this.closest(".item");
	let iID = parseInt(oItem.dataset.itemId);
	let sName = oItem.querySelector(".name").textContent.trim();

	if(window.confirm(`"${sName}" wirklich löschen?`)) {
		Api.item.delete(iID).then(() => {
			oItem.remove();
			Venue.decrementItemCount(iCurrentVenueId);
		}, Error.show);
	}
}

function createElement(oItem=null) {
	let oElement = document.createElement("tr");
	oElement.classList.add("item");

	let oCell = document.createElement("td");
	oCell.classList.add("button");
	oElement.appendChild(oCell);
	let oDeleteButton = document.createElement("img");
	oDeleteButton.setAttribute("src", "/image/delete_icon.svg");
	oDeleteButton.addEventListener("click", deleteListener);
	oCell.appendChild(oDeleteButton);

	oCell = document.createElement("td");
	oCell.classList.add("button");
	oElement.appendChild(oCell);
	let oEditButton = document.createElement("img");
	oEditButton.setAttribute("src", "/image/edit_icon.svg");
	oEditButton.addEventListener("click", editListener);
	oCell.appendChild(oEditButton);

	let oNameCell = document.createElement("td");
	oNameCell.classList.add("name");
	oElement.appendChild(oNameCell);

	let oPriceCell = document.createElement("td");
	oPriceCell.classList.add("price");
	oElement.appendChild(oPriceCell);


	if(oItem) {
		oElement.dataset.itemId = oItem.id;
		oElement.dataset.itemCategoryId = oItem.itemCategory;
		oNameCell.textContent = oItem.name;
		let fPrice = parseFloat(oItem.price);
		if(!isNaN(fPrice)) {
			oPriceCell.textContent = parseFloat(fPrice).toFixed(2)+" €";
		}
	}

	return oElement;
}


function insertElement(oItemElement) {
	if(!oItemElement.classList.contains("item")) {
		return;
	}
	let iItemCategoryID = parseInt(oItemElement.dataset.itemCategoryId);
	if(isNaN(iItemCategoryID)) {
		return;
	}
	let oItemTableBody = document.getElementById("itemContainer").querySelector(".item-category[data-item-category-id=\""+iItemCategoryID+"\"] .item-table > tbody");

	if(oItemTableBody) {
		insertSorted(oItemTableBody, oItemElement, SORT_ASC, ".name");
	}
}

function getElement(iItemID) {
	return document.getElementById("itemContainer").querySelector(".item-table > tbody .item[data-item-id=\""+iItemID+"\"");
}




function createItemTable() {
	let oTable = document.createElement("table");
	oTable.classList.add("item-table");

	let oThead = document.createElement("thead");
	let oTbody = document.createElement("tbody");
	oTable.appendChild(oThead);
	oTable.appendChild(oTbody);

	let oRow = document.createElement("tr");
	oThead.appendChild(oRow);

	let oButton = document.createElement("th");
	oButton.classList.add("button");
	oRow.appendChild(oButton);
	oRow.appendChild(oButton.cloneNode());

	let oName = document.createElement("th");
	oName.classList.add("name");
	oName.textContent = "Name";
	oRow.appendChild(oName);

	let oPrice = document.createElement("th");
	oPrice.classList.add("price");
	oPrice.textContent = "Preis";
	oRow.appendChild(oPrice);

	return oTable;
}




function loadItemsForCategory(oItemCategoryElement) {
	let iItemCategoryID = parseInt(oItemCategoryElement.dataset.itemCategoryId);
	if(isNaN(iItemCategoryID)) {
		return null;
	}

	ItemCategory.clearItemCategory(oItemCategoryElement);
	return Api.item.getAll(iItemCategoryID).then(oResponse => {
		let oTableBody = oItemCategoryElement.querySelector(".item-table > tbody");

		let aItems = oResponse.json;
		for(let oItem of aItems) {
			let oItemElement = createElement(oItem);
			oTableBody.appendChild(oItemElement);
		}
	}, Error.show);
}



function init() {
	document.getElementById("newItemForm").addEventListener("submit", newItemListener);
}

export default {
	init,

	clearNewItemForm,

	loadVenue,
	clear,

	updateVenueName,

	getElement,

	createItemTable,
};
