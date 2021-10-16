import * as Api from '../Api.js';
import * as Error from '../Error.js';
import * as Venue from './Venue.js';
import { SORT_ASC, insertSorted } from '../functions.js';

function newItemListener(ev) {
	ev.preventDefault();
	let oEditor = document.getElementById("itemEditor");
	if(!oEditor.classList.contains("visible")) {
		return;
	}

	let iVenueID = parseInt(oEditor.dataset.venueId);
	if(isNaN(iVenueID)) {
		return;
	}
	let sName = document.getElementById("newItemName").value;
	let fPrice = document.getElementById("newItemPrice").value;

	Api.item.create(iVenueID, sName, fPrice).then((oResponse) => {
		let iID = oResponse.json.id;
		let oItemElement = createElement({
			id: iID,
			name: sName,
			price: fPrice,
		});
		insertElement(oItemElement);

		let oEditor = document.getElementById("itemEditor");
		let iVenueID = parseInt(oEditor.dataset.venueId);
		Venue.incrementUpdateCount(iVenueID);
	}).catch((error) => {
		Error.show(error);
	});
}


function clearEditor() {
	let oItemTable = document.getElementById("itemTable");
	let oBody = oItemTable.querySelector("tbody");
	while(oBody.firstChild) {
		oBody.firstChild.remove();
	}
}

function openEditor(iVenueID) {
	let oVenue = Venue.getElement(iVenueID);
	if(!oVenue) {
		closeEditor();
		return;
	}
	let oEditor = document.getElementById("itemEditor");

	if(iVenueID != oEditor.dataset.venueId) {
		oEditor.querySelector(".venueName").innerHTML = oVenue.querySelector(".name").textContent;

		oEditor.dataset.venueId = iVenueID;
		if(oVenue.nextElementSibling) {
			oVenue.parentElement.insertBefore(oEditor, oVenue.nextElementSibling);
		}
		else {
			oVenue.parentElement.appendChild(oEditor);
		}

		clearEditor();
		Api.item.getAll(iVenueID).then((oResponse) => {
			let oTableBody = oEditor.querySelector("#itemTable > tbody");

			let aItems = oResponse.json;
			for(let oItem of aItems) {
				let oItemElement = createElement(oItem);
				oTableBody.appendChild(oItemElement);
			}
		}).catch((error) => {
			Error.show(error);
		});
	}
	oEditor.classList.add("visible");
}
function closeEditor() {
	let oEditor = document.getElementById("itemEditor");
	oEditor.classList.remove("visible");
}




function editListener(ev) {
	ev.stopPropagation();
}

function deleteListener(ev) {
	ev.stopPropagation();
	let oItem = this.closest(".item");
	let iID = parseInt(oItem.dataset.itemId);
	let sName = oItem.querySelector(".name").textContent.trim();

	if(window.confirm(`"${sName}" wirklich löschen?`)) {
		Api.item.delete(iID).then(() => {
			oItem.remove();

			let oEditor = document.getElementById("itemEditor");
			let iVenueID = parseInt(oEditor.dataset.venueId);
			Venue.decrementUpdateCount(iVenueID);
		}).catch((error) => {
			Error.show(error);
		});
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
		oNameCell.innerHTML = oItem.name;
		let fPrice = parseFloat(oItem.price);
		if(!isNaN(fPrice)) {
			oPriceCell.innerHTML = parseFloat(fPrice).toFixed(2)+" €";
		}
	}

	return oElement;
}


function insertElement(oItemElement) {
	if(!oItemElement.classList.contains("item")) {
		return;
	}
	let oItemTableBody = document.getElementById("itemTable").querySelector("tbody");

	insertSorted(oItemTableBody, oItemElement, SORT_ASC, ".name");
}






function init() {
	document.getElementById("newItemForm").addEventListener("submit", newItemListener);
}

export {
	init,

	openEditor,
	closeEditor,
	createElement,
	insertElement,
};
