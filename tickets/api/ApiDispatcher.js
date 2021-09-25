import { HttpDispatcher, HttpDispatcherGroup } from "../../modules/HttpDispatcher.js";

let oApiDispatcher = new class extends HttpDispatcherGroup {
	dispatch(sPath, request, response) {
		response.setHeader("Cache-Control", "no-store");
		super.dispatch(sPath, request, response);
	}
}(false);


let oDefault = new HttpDispatcher();
oDefault.dispatch = function(sPath, request, response) {
	console.log("api: ", sPath);
	response.writeHead(200);
	response.end("api");
}
oApiDispatcher.setFallbackDispatcher(oDefault);


function init(oConfig, oDbConnection) {

}

export default {
	init,
	apiDispatcher: oApiDispatcher,
};
