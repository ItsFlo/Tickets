import Api from "../Api.js";
import Error from "../Error.js";

function getCurrentVenueId() {
	let itemEditor = document.getElementById("itemEditor");
	let venueId = parseInt(itemEditor.dataset.venueId);
	if(isNaN(venueId)) {
		return null;
	}
	return venueId;
}
function getCssEditor() {
	return document.getElementById("itemEditor").querySelector(".css-editor");
}

function load(venueId) {
	let cssEditor = getCssEditor();
	let textArea = cssEditor.querySelector("textarea");
	textArea.value = "";
	textArea.style.width = "";
	textArea.style.height = "";
	return Api.venueCss.get(venueId).then(result => {
		cssEditor.dataset.cssExists = true;
		textArea.value = result.json.css;
	}, err => {
		delete cssEditor.dataset.cssExists;
	});
}


function saveListener() {
	let venueId = getCurrentVenueId();
	if(venueId === null) {
		return;
	}
	let cssEditor = getCssEditor();
	let textArea = cssEditor.querySelector("textarea");
	let css = textArea.value;

	if(cssEditor.dataset.cssExists) {
		Api.venueCss.update(venueId, css).catch(Error.show);
	}
	else {
		Api.venueCss.create(venueId, css).catch(Error.show);
	}
}

function init() {
	let cssEditor = getCssEditor();
	let saveButton = cssEditor.querySelector("button");
	saveButton.addEventListener("click", saveListener);
}

export default {
	load,
	init,
};
