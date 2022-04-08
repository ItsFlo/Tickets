import Api from "../Api.js";

function filterListener() {
	let itemCatId = parseInt(this.dataset.id);
	callListeners(itemCatId, this.checked);
}
function createFilter(itemCat) {
	let template = document.getElementById("itemCategoryFilterTemplate");
	let element = template.content.firstElementChild.cloneNode(true);

	let input = element.querySelector("input");
	input.dataset.id = itemCat.id;
	input.addEventListener("change", filterListener);
	element.querySelector("span").textContent = itemCat.name;

	return element;
}



function clear() {
	let filterContainer = document.getElementById("CategoryFilter");
	while(filterContainer.firstChild) {
		filterContainer.firstChild.remove();
	}
}
function load(venueId) {
	clear();
	return Api.itemCategory.getAll(venueId).then(result => {
		let filterContainer = document.getElementById("CategoryFilter");
		for(let itemCat of result.json) {
			let filter = createFilter(itemCat);
			filterContainer.appendChild(filter);
		}
	});
}


let listeners = new Set();
function addListener(listener) {
	if(typeof listener === "function") {
		listeners.add(listener);
	}
}
function removeListener(listener) {
	listeners.delete(listener);
}
function callListeners(catId, checked) {
	for(let listener of listeners) {
		listener(catId, checked);
	}
}

export default {
	clear,
	load,

	addListener,
	removeListener,
};
