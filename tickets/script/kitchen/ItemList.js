import Api from "../Api.js";
import Error from "../Error.js";

const ID = "itemContainer";

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

function load(venueId) {
	let status = [
		Api.order.STATUS_OPEN,
	];
	return loadItemCategories(venueId).then(() => {
		return Api.orderItem.getAllForVenue(venueId, status).then(result => {
			for(let item of result.json) {
				let itemCategory = getItemCategory(item.itemCategory);
				if(!itemCategory) {
					continue;
				}

				let element = getItemElementTemplate();
				itemElementAddData(element, item);
				itemCategory.querySelector(".item-container").appendChild(element);
			}
		});
	}).catch(err => Error.show(err));
}

export default {
	clear: clearItemCategories,
	load,
};
