const SORT_ASC = "ASC";
const SORT_DESC = "DESC";

function insertSorted(oParent, oElement, sSortOrder, sSortElementSelector=null, sSortAttributeName=null, sChildClass=null) {
	let aChildren = Array.from(oParent.children);
	for(let ii=0;ii<aChildren.length;++ii) {
		if(aChildren[ii] === oElement) {
			aChildren.splice(ii, 1);
			--ii;
			continue;
		}
		if(sChildClass) {
			if(!aChildren[ii].classList.contains(sChildClass)) {
				aChildren.splice(ii, 1);
				--ii;
			}
		}
	}
	let iLen = aChildren.length;
	if(!iLen) {
		oParent.appendChild(oElement);
		return;
	}

	let oCompElementNew = sSortElementSelector? oElement.querySelector(sSortElementSelector) : oElement;
	if(!oCompElementNew) {
		return;
	}
	let sCompNew = sSortAttributeName? oCompElementNew.getAttribute(sSortAttributeName) : oCompElementNew.textContent;

	let iStartIndex = 0;
	let iEndIndex = iLen;
	while(true) {
		if(!iEndIndex) {
			oParent.insertBefore(oElement, oParent.firstElementChild);
			return;
		}
		if(iStartIndex >= iLen) {
			oParent.appendChild(oElement);
			return;
		}

		let iInterval = iEndIndex - iStartIndex;
		if(!iInterval) {
			oParent.insertBefore(oElement, aChildren[iStartIndex]);
			return;
		}
		let iIndex = iStartIndex + Math.floor((iInterval / 2));

		let oComp = aChildren[iIndex];
		let oCompElementOld = sSortElementSelector? oComp.querySelector(sSortElementSelector) : oComp;
		if(!oCompElementOld) {
			return;
		}
		let sCompOld = sSortAttributeName? oCompElementOld.getAttribute(sSortAttributeName) : oCompElementOld.textContent;

		let bIsGreater = sSortOrder===SORT_DESC? sCompNew < sCompOld : sCompNew >= sCompOld;
		if(bIsGreater) {
			iStartIndex = iIndex+1;
		}
		else {
			iEndIndex = iIndex;
		}
	}
}

function datePadNumber(value) {
	return value < 10 ? ("0"+value) : value.toString();
}
function formatDate(date) {
	let dateString = date.getFullYear() + "-";
	dateString += datePadNumber(date.getMonth()+1) + "-";
	dateString += datePadNumber(date.getDate());
	return dateString;
}
function formatTime(date) {
	let sTimeString = date.getHours() + ":";
	sTimeString += datePadNumber(date.getMinutes()) + ":";
	sTimeString += datePadNumber(date.getSeconds());
	return sTimeString;
}


function addLoadListener(listener) {
	if(typeof listener !== "function") {
		return;
	}

	if(document.readyState === "complete") {
		listener();
	}
	else {
		window.addEventListener("load", listener);
	}
}



function getPathPart(index) {
	if(typeof index !== "number" || index < 0) {
		return null;
	}
	let pathsParts = window.location.pathname.split("/").filter(tmp => tmp);
	if(pathsParts.length > index) {
		return pathsParts[index];
	}
	return null;
}



export {
	SORT_ASC,
	SORT_DESC,
	insertSorted,

	formatDate,
	formatTime,

	addLoadListener,

	getPathPart,
};
