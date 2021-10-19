import Api from "../Api.js";
import Error from "../Error.js";
import Venue from "./Venue.js";
import Item from "./Item.js";
import { SORT_ASC, insertSorted } from "../functions.js";

function clearNewItemCategoryForm() {
	let oNameInput = document.getElementById("newItemCategoryName");
	oNameInput.value = "";
}



function newItemCategoryListener(ev) {
	ev.preventDefault();
	let oEditor = document.getElementById("itemEditor");
	if(!oEditor.classList.contains("visible")) {
		return;
	}

	let iVenueID = parseInt(oEditor.dataset.venueId);
	if(isNaN(iVenueID)) {
		return;
	}
	let sName = document.getElementById("newItemCategoryName").value;

	Api.itemCategory.create(iVenueID, sName).then((oResponse) => {
		let iID = oResponse.json.id;
		let oItemCategory = {
			id: iID,
			name: sName,
		};
		let oItemCategoryElement = createElement(oItemCategory);
		insertElement(oItemCategoryElement);
		addToSelect(oItemCategory);

		let oName = document.getElementById("newItemCategoryName");
		oName.focus();
		oName.select();
	}).catch((error) => {
		Error.show(error);
	});
}





function editListener() {
	let oItemCategoryElement = this.closest(".item-category");
	editItemCategory(oItemCategoryElement);
}

function deleteListener() {
	let oItemCategory = this.closest(".item-category");
	let iID = parseInt(oItemCategory.dataset.itemCategoryId);
	let sName = oItemCategory.querySelector(".category-name").textContent.trim();

	if(window.confirm(`Kategorie "${sName}" wirklich löschen?`)) {
		Api.itemCategory.delete(iID).then(() => {
			let aItems = oItemCategory.querySelectorAll(".item-table tbody > .item");
			let iItemCount = aItems.length;

			oItemCategory.remove();
			removeFromSelect(iID);

			let oEditor = document.getElementById("itemEditor");
			let iVenueID = parseInt(oEditor.dataset.venueId);
			Venue.updateItemCount(iVenueID, -iItemCount);
		}).catch((error) => {
			Error.show(error);
		});
	}
}


function createElement(oItemCategory=null) {
	let oElement = document.createElement("div");
	oElement.classList.add("item-category");

	let oHeader = document.createElement("div");
	oHeader.classList.add("header");
	oElement.appendChild(oHeader);

	let oName = document.createElement("h4");
	oName.classList.add("category-name");
	oHeader.appendChild(oName);

	let oEditButton = document.createElement("img");
	oEditButton.classList.add("button");
	oEditButton.setAttribute("src", "/image/edit_icon.svg");
	oEditButton.addEventListener("click", editListener);
	oHeader.appendChild(oEditButton);

	let oDeleteButton = document.createElement("img");
	oDeleteButton.classList.add("button");
	oDeleteButton.setAttribute("src", "/image/delete_icon.svg");
	oDeleteButton.addEventListener("click", deleteListener);
	oHeader.appendChild(oDeleteButton);


	let oItemTable = Item.createItemTable();
	oElement.appendChild(oItemTable);

	if(oItemCategory) {
		oElement.dataset.itemCategoryId = oItemCategory.id;
		oName.innerHTML = oItemCategory.name;
	}

	return oElement;
}

function insertElement(oItemCategoryElement) {
	if(!oItemCategoryElement.classList.contains("item-category")) {
		return;
	}
	let oItemContainer = document.getElementById("itemContainer");

	insertSorted(oItemContainer, oItemCategoryElement, SORT_ASC, ".category-name");
}

function getElement(iItemCategoryID) {
	return document.getElementById("itemContainer").querySelector(".item-category[data-item-category-id=\""+iItemCategoryID+"\"");
}
function getAllElements() {
	return document.getElementById("itemContainer").querySelectorAll(".item-category");
}



function selectInsertElement(oOption) {
	if(oOption.tagName !== "OPTION" || !oOption.classList.contains("category")) {
		return;
	}
	let oSelect = document.getElementById("newItemCategory");
	if(oSelect.children.length <= 1) {
		oSelect.appendChild(oOption);
		return;
	}
	insertSorted(oSelect, oOption, SORT_ASC, null, null, "category");

	let oDefault = oSelect.querySelector("option[disabled]");
	oSelect.insertBefore(oDefault, oSelect.firstElementChild);
}
function addToSelect(oItemCategory) {
	let oSelect = document.getElementById("newItemCategory");
	let oOption = oSelect.querySelector("option[value=\""+oItemCategory.id+"\"");
	if(oOption) {
		return;
	}

	oOption = document.createElement("option");
	oOption.classList.add("category");
	oOption.setAttribute("value", oItemCategory.id);
	oOption.innerHTML = oItemCategory.name;

	selectInsertElement(oOption);
}
function updateSelectOption(oItemCategory) {
	let oSelect = document.getElementById("newItemCategory");
	let oOption = oSelect.querySelector("option[value=\""+oItemCategory.id+"\"");
	if(!oOption) {
		return;
	}

	oOption.innerHTML = oItemCategory.name;
	selectInsertElement(oOption);
}
function removeFromSelect(iItemCategoryID) {
	let oSelect = document.getElementById("newItemCategory");
	
	let oOption = oSelect.querySelector("option[value=\""+iItemCategoryID+"\"");
	if(oOption) {
		if(oSelect.value == iItemCategoryID) {
			oSelect.value = "";
		}
		oOption.remove();
	}
}
function clearSelect() {
	let oSelect = document.getElementById("newItemCategory");
	let aOptions = Array.from(oSelect.querySelectorAll(".category"));
	for(let oOption of aOptions) {
		oOption.remove();
	}
	oSelect.value = "";
}






function saveEditListener(ev) {
	ev.preventDefault();
	let oItemCategory = this.closest(".item-category");
	let iID = parseInt(oItemCategory.dataset.itemCategoryId);
	if(isNaN(iID)) {
		abortEditItemCategory(oItemCategory);
		return;
	}

	let sNewName = oItemCategory.querySelector(".header .category-name.edit").value.trim();

	let oOldName = oItemCategory.querySelector(".header .category-name:not(.edit)");

	let bChanges = false;
	let bReInsert = false;
	if(sNewName !== oOldName.textContent.trim()) {
		bChanges = true;
		bReInsert = true;
	}
	else {
		sNewName = null;
	}

	if(bChanges) {
		Api.itemCategory.update(iID, sNewName).then(() => {
			if(sNewName) {
				oOldName.innerHTML = sNewName;
			}
			abortEditItemCategory(oItemCategory);
			updateSelectOption({
				id: iID,
				name: sNewName,
			});
			if(bReInsert) {
				insertElement(oItemCategory);
			}
		}).catch((error) => {
			Error.show(error);
			abortEditItemCategory(oItemCategory);
		})
	}
	else {
		abortEditItemCategory(oItemCategory);
	}
}
function abortEditListener(ev) {
	ev.stopPropagation();
	let oItemCategory = this.closest(".item-category");
	abortEditItemCategory(oItemCategory);
}

function editEscapeKeyListener(ev) {
	if(ev.key === "Escape") {
		ev.stopPropagation();
		let oItemCategory = this.closest(".item-category");
		abortEditItemCategory(oItemCategory);
	}
}

function editItemCategory(oItemCategory) {
	if(oItemCategory.classList.contains("edit")) {
		return;
	}
	let oHeader = oItemCategory.querySelector(".header");
	let iItemCategoryID = parseInt(oItemCategory.dataset.itemCategoryId);
	let sFormID = "editItemCategoryForm_" + iItemCategoryID;


	let oDoneButton = document.createElement("button");
	oDoneButton.classList.add("button");
	oDoneButton.classList.add("edit");
	oDoneButton.setAttribute("type", "submit");
	oDoneButton.setAttribute("form", sFormID);
	let oDoneButtonIcon = document.createElement("img");
	oDoneButtonIcon.setAttribute("src", "/image/done_icon.svg");
	oDoneButtonIcon.setAttribute("height", "100%");
	oDoneButton.appendChild(oDoneButtonIcon);

	let oClearButton = document.createElement("img");
	oClearButton.classList.add("button");
	oClearButton.classList.add("edit");
	oClearButton.setAttribute("src", "/image/clear_icon.svg");
	oClearButton.addEventListener("click", abortEditListener);


	let oForm = document.createElement("form");
	oForm.id = sFormID;
	oForm.addEventListener("submit", saveEditListener);


	let oNameInput = document.createElement("input");
	oNameInput.classList.add("category-name");
	oNameInput.classList.add("edit");
	oNameInput.setAttribute("type", "text");
	oNameInput.setAttribute("required", "required");
	oNameInput.setAttribute("placeholder", "Name");
	oNameInput.setAttribute("form", sFormID);
	oNameInput.addEventListener("keyup", editEscapeKeyListener);
	oNameInput.value = oHeader.querySelector(".category-name").textContent.trim();

	oHeader.appendChild(oForm);
	oHeader.appendChild(oNameInput);
	oHeader.appendChild(oDoneButton);
	oHeader.appendChild(oClearButton);
	oItemCategory.classList.add("edit");

	oNameInput.focus();
	oNameInput.select();
}
function abortEditItemCategory(oItemCategory) {
	let aButtons = Array.from(oItemCategory.querySelectorAll(".button.edit"));
	for(let oButton of aButtons) {
		oButton.remove();
	}

	let oForm = oItemCategory.querySelector("form");
	if(oForm) {
		oForm.remove();
	}

	let aEditInputs = Array.from(oItemCategory.querySelectorAll("input.edit"));
	for(let oEditInput of aEditInputs) {
		oEditInput.remove();
	}

	oItemCategory.classList.remove("edit");
}




function loadItemCategories(iVenueID) {
	Item.clearEditor();

	return Api.itemCategory.getAll(iVenueID).then((oResponse) => {
		let oItemContainer = document.getElementById("itemContainer");

		let aItemCategories = oResponse.json;
		for(let oItemCategory of aItemCategories) {
			let oItemCategoryElement = createElement(oItemCategory);
			oItemContainer.appendChild(oItemCategoryElement);
			addToSelect(oItemCategory);
		}
	}).catch((error) => {
		Error.show(error);
	});
}
function clearItemCategory(oItemCategoryElement) {
	let oBody = oItemCategoryElement.querySelector(".item-table > tbody");
	if(oBody) {
		while(oBody.firstElementChild) {
			oBody.firstElementChild.remove();
		}
	}
}



function init() {
	document.getElementById("newItemCategoryForm").addEventListener("submit", newItemCategoryListener);
}

export default {
	init,

	clearNewItemCategoryForm,

	createElement,
	insertElement,
	getElement,
	getAllElements,

	clearSelect,

	loadItemCategories,
	clearItemCategory,
};
