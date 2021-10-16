import * as Venue from './admin/Venue.js';
import * as Item from './admin/Item.js';

function documentLoadListener() {
	Venue.init();
	Item.init();
}
if(document.readyState === "complete") {
	documentLoadListener();
}
else {
	window.addEventListener("load", documentLoadListener);
}
