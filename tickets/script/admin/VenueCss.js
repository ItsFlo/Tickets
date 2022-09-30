import Api from "../Api.js";
import Error from "../Error.js";

let iCurrentVenueId = null;

function getCssEditor() {
	return document.getElementById("itemEditor").querySelector(".css-editor");
}

function load(venueId) {
	clear();

	venueId = parseInt(venueId);
	if(isNaN(venueId)) {
		return;
	}
	iCurrentVenueId = venueId;

	let cssEditor = getCssEditor();
	let textArea = cssEditor.querySelector("textarea");
	return Api.venueCss.get(venueId).then(result => {
		cssEditor.dataset.cssExists = true;
		textArea.value = result.json.css;
	}, err => {
		if(!(err instanceof Api.HttpError) || err.httpStatus !== 404) {
			Error.show(err);
		}
	});
}
function clear() {
	let cssEditor = getCssEditor();
	let textArea = cssEditor.querySelector("textarea");
	textArea.value = "";
	textArea.style.width = "";
	textArea.style.height = "";
	delete cssEditor.dataset.cssExists;

	iCurrentVenueId = null;
}


function saveListener() {
	if(iCurrentVenueId === null) {
		return;
	}
	let cssEditor = getCssEditor();
	let textArea = cssEditor.querySelector("textarea");
	let css = textArea.value;

	if(cssEditor.dataset.cssExists) {
		Api.venueCss.update(iCurrentVenueId, css).catch(Error.show);
	}
	else {
		Api.venueCss.create(iCurrentVenueId, css).then(() => {
			cssEditor.dataset.cssExists = true;
		}, Error.show);
	}
}

function init() {
	let cssEditor = getCssEditor();
	let saveButton = cssEditor.querySelector("button");
	saveButton.addEventListener("click", saveListener);
}

export default {
	init,

	load,
	clear,
};
