import { HttpMethodDispatcher } from "../../modules/HttpDispatcher.js";
import VenueCssPutDispatcher from "./venueCss/VenueCssPutDispatcher.js";
import VenueCssDeleteDispatcher from "./venueCss/VenueCssDeleteDispatcher.js";
import VenueCssPatchDispatcher from "./venueCss/VenueCssPatchDispatcher.js";
import VenueCssGetDispatcher from "./venueCss/VenueCssGetDispatcher.js";



let venueCssDispatcher = new HttpMethodDispatcher();
venueCssDispatcher.setPutDispatcher(new VenueCssPutDispatcher());
venueCssDispatcher.setDeleteDispatcher(new VenueCssDeleteDispatcher());
venueCssDispatcher.setPatchDispatcher(new VenueCssPatchDispatcher());
venueCssDispatcher.setGetDispatcher(new VenueCssGetDispatcher());

export default venueCssDispatcher;
