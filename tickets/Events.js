import SseDispatcher from "../modules/SseDispatcher.js";

let eventDispatchers = {};
let eventQueue = {};

function addEventDispatcher(eventCategory, sseDispatcher) {
	if(!eventCategory || !sseDispatcher instanceof SseDispatcher) {
		return;
	}

	if(eventDispatchers[eventCategory]) {
		eventDispatchers[eventCategory].push(sseDispatcher);
	}
	else {
		eventDispatchers[eventCategory] = [
			sseDispatcher,
		];
		eventQueue[eventCategory] = [];
	}
}



function sendEvent(eventCategory, eventName, data) {
	if(!eventCategory || typeof eventCategory !== "string" || !eventName || typeof eventName !== "string" || !data) {
		return;
	}

	if(eventQueue[eventCategory]) {
		eventQueue[eventCategory].push({
			event: eventName,
			data: data,
		});
	}
}


let isFlushing = false;
function flushQueue() {
	if(isFlushing) {
		return;
	}
	isFlushing = true;

	for(let eventCategory in eventQueue) {
		for(let event of eventQueue[eventCategory]) {
			for(let dispatcher of eventDispatchers[eventCategory]) {
				if(event.event) {
					try {
						dispatcher.sendEvent(event.event, event.data);
					} catch (err) {
						console.error(err);
					}
				}
				else {
					try {
						dispatcher.send(event.data);
					} catch (err) {
						console.error(err);
					}
				}
			}
		}
		eventQueue[eventCategory] = [];
	}

	isFlushing = false;
}


let interval = null;
function stopInterval() {
	clearInterval(interval);
	interval = null;
}
function startInterval() {
	stopInterval();
	interval = setInterval(flushQueue, 10);
}
function init() {
	startInterval();
}


export default {
	init,

	addEventDispatcher,

	sendEvent,
	flushQueue,
};
