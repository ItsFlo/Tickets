const ORDER_DIRECTIONS = ["ASC", "DESC"];

function getOrderDirection(searchParams, defaultOrder="ASC") {
	if(!searchParams.has("order")) {
		return defaultOrder;
	}
	let order = searchParams.get("order").toUpperCase();
	if(ORDER_DIRECTIONS.includes(order)) {
		return order;
	}
	return defaultOrder;
}

function getLimit(searchParams, defaultLimit=null) {
	if(!searchParams.has("limit")) {
		return defaultLimit;
	}
	let limit = parseInt(searchParams.get("limit"));
	if(!isNaN(limit) && limit > 0) {
		return limit;
	}
	return defaultLimit;
}


export {
	getOrderDirection,
	getLimit,
};
