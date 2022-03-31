import SseDispatcher from "../modules/SseDispatcher.js";

let oEventDispatchers = {};
let oEventQueue = {};

function addEventDispatcher(sEventCategory, oSseDispatcher) {
	if(!sEventCategory || !oSseDispatcher instanceof SseDispatcher) {
		return;
	}

	if(oEventDispatchers[sEventCategory]) {
		oEventDispatchers[sEventCategory].push(oSseDispatcher);
	}
	else {
		oEventDispatchers[sEventCategory] = [
			oSseDispatcher,
		];
		oEventQueue[sEventCategory] = [];
	}
}



function sendEvent(sEventCategory, sEventName, data) {
	if(!sEventCategory || typeof sEventCategory !== "string" || !sEventName || typeof sEventName !== "string" || !data) {
		return;
	}

	if(oEventQueue[sEventCategory]) {
		oEventQueue[sEventCategory].push({
			event: sEventName,
			data: data,
		});
	}
}


let bFlushing = false;
function flushQueue() {
	if(bFlushing) {
		return;
	}
	bFlushing = true;

	for(let sEventCategory in oEventQueue) {
		for(let oEvent of oEventQueue[sEventCategory]) {
			for(let oDispatcher of oEventDispatchers[sEventCategory]) {
				if(oEvent.event) {
					try {
						oDispatcher.sendEvent(oEvent.event, oEvent.data);
					} catch (err) {
						console.error(err);
					}
				}
				else {
					try {
						oDispatcher.send(oEvent.data);
					} catch (err) {
						console.error(err);
					}
				}
			}
		}
		oEventQueue[sEventCategory] = [];
	}

	bFlushing = false;
}


let iInterval = null;
function stopInterval() {
	clearInterval(iInterval);
	iInterval = null;
}
function startInterval() {
	stopInterval();
	iInterval = setInterval(flushQueue, 10);
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
