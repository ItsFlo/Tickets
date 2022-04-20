import { addLoadListener } from "./functions.js";

const LIGHT = "light";
const DARK = "dark";
const THEMES = [
	LIGHT,
	DARK,
];

const DARK_MODE_CLASS = "dark-mode";
const EXPLICIT_THEME_CLASS = "explicit-theme";
const STORAGE_KEY = "theme-preference";

const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

function getTheme() {
	let themePreference = window.localStorage.getItem(STORAGE_KEY);
	if(THEMES.includes(themePreference)) {
		return themePreference;
	}

	return mediaQuery.matches? DARK : LIGHT;
}
function updateDocumentCssClasses() {
	let themePreference = window.localStorage.getItem(STORAGE_KEY);
	let themeIsExplicit = THEMES.includes(themePreference);
	document.documentElement.classList.toggle(EXPLICIT_THEME_CLASS, themeIsExplicit);

	let theme = getTheme();
	document.documentElement.classList.toggle(DARK_MODE_CLASS, theme === DARK);
}


function setThemePreference(theme) {
	if(!THEMES.includes(theme)) {
		return;
	}
	window.localStorage.setItem(STORAGE_KEY, theme);
	updateDocumentCssClasses();
}
function toggleThemePreference(theme) {
	if(!THEMES.includes(theme)) {
		return;
	}

	let currentTheme = window.localStorage.getItem(STORAGE_KEY);
	if(theme !== currentTheme) {
		setThemePreference(theme);
	}
	else {
		clearThemePreference();
	}
}
function clearThemePreference() {
	window.localStorage.removeItem(STORAGE_KEY);
	updateDocumentCssClasses();
}



function lightButtonListener() {
	toggleThemePreference(LIGHT);
}
function darkButtonListener() {
	toggleThemePreference(DARK);
}
function initButton(button) {
	let lightButton = document.createElement("span");
	lightButton.classList.add("light");
	lightButton.addEventListener("click", lightButtonListener);

	let darkButton = document.createElement("span");
	darkButton.classList.add("dark");
	darkButton.addEventListener("click", darkButtonListener);

	button.appendChild(lightButton);
	button.appendChild(darkButton);
}
function initAllButtons() {
	let buttons = document.querySelectorAll("#darkModeButton");
	for(let button of buttons) {
		initButton(button);
	}
}

function addStyleSheet() {
	let element = document.createElement("link");
	element.type = "text/css";
	element.rel = "stylesheet";
	element.href = "/style/darkMode.css";
	document.head.appendChild(element);
}

function storageListener(ev) {
	if(ev.key === STORAGE_KEY) {
		updateDocumentCssClasses();
	}
}

function init() {
	addStyleSheet();
	updateDocumentCssClasses();

	mediaQuery.addEventListener("change", updateDocumentCssClasses);
	window.addEventListener("storage", storageListener);

	addLoadListener(initAllButtons);
}
init();

export default {
	LIGHT,
	DARK,
	THEMES,

	setThemePreference,
	toggleThemePreference,
	clearThemePreference,
};
