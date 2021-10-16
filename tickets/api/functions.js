function getOrderDirection(aPathElements, sDefaultOrderDirection = "ASC") {
	let sOrder = null;
	let iLen = aPathElements.length;
	for(let ii=0;ii<iLen;++ii) {
		if(ii+1 < iLen && aPathElements[ii].toUpperCase() === "ORDER") {
			sOrder = aPathElements[ii+1].toUpperCase();
			break;
		}
	}

	let aOrderDirections = ["ASC", "DESC"];
	if(sOrder && aOrderDirections.includes(sOrder)) {
		return sOrder;
	}
	if(aOrderDirections.includes(sDefaultOrderDirection)) {
		return sDefaultOrderDirection;
	}
	return "ASC";
}
function getLimit(aPathElements, iDefaultLimit = null) {
	let iLimit = NaN;
	let iLen = aPathElements.length;
	for(let ii=0;ii<iLen;++ii) {
		if(ii+1 < iLen && aPathElements[ii].toUpperCase() === "LIMIT") {
			iLimit = parseInt(aPathElements[ii+1]);
			break;
		}
	}

	if(!isNaN(iLimit) && iLimit > 0) {
		return iLimit;
	}
	if(!isNaN(iDefaultLimit) && iDefaultLimit > 0) {
		return iDefaultLimit;
	}
	return null;
}


export {
	getOrderDirection,
	getLimit,
};
