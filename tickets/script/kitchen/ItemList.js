import Api from "../Api.js";
import Error from "../Error.js";

const ID = "itemContainer";

function clear() {
	let itemList = document.getElementById(ID);
	while(itemList.firstChild) {
		itemList.firstChild.remove();
	}
}


function createElement() {
	let element = document.createElement("div");

	let name = document.createElement("span");
	name.classList.add("name");
	element.appendChild(name);
	
	let count = document.createElement("span");
	count.classList.add("count");
	element.appendChild(count);

	return element;
}
function elementAddData(element, item) {
	element.querySelector(".name").textContent = item.name;
	element.querySelector(".count").textContent = item.count;
}

function load(venueID) {
	clear();
	let status = [
		Api.order.STATUS_OPEN,
	];
	Api.orderItem.getAllForVenue(venueID, status).then(items => {
		let itemContainer = document.getElementById(ID);
		for(let item of items.json) {
			let element = createElement();
			elementAddData(element, item);
			itemContainer.appendChild(element);
		}
	}, err => {
		Error.show(err);
	});
}

export default {
	clear,
	load,
};
