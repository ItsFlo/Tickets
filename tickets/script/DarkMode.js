const DARK_MODE_CLASS = "dark-mode";
const STORAGE_KEY = "dark-mode";

const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

function isDarkMode() {
	let darkModePreference = window.localStorage.getItem(STORAGE_KEY);
	if(darkModePreference === "true") {
		return true
	}
	else if(darkModePreference === "false") {
		return false;
	}

	return mediaQuery.matches;
}
function updateDarkMode() {
	let darkMode = isDarkMode();
	document.documentElement.classList.toggle(DARK_MODE_CLASS, darkMode);
}


function setDarkModePreference(darkMode=true) {
	window.localStorage.setItem(STORAGE_KEY, !!darkMode);
	updateDarkMode();
}
function clearDarkModePreference() {
	window.localStorage.removeItem(STORAGE_KEY);
	updateDarkMode();
}



function init() {
	updateDarkMode();

	mediaQuery.addEventListener("change", updateDarkMode);
	window.addEventListener("storage", updateDarkMode);
}
init();

export default {
	setDarkModePreference,
	clearDarkModePreference,
};
