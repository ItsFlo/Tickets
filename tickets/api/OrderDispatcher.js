import { HttpMethodDispatcher } from "../../modules/HttpDispatcher.js";
import OrderPutDispatcher from "./order/OrderPutDispatcher.js";
import OrderDeleteDispatcher from "./order/OrderDeleteDispatcher.js";
import OrderPatchDispatcher from "./order/OrderPatchDispatcher.js";
import OrderGetDispatcher from "./order/OrderGetDispatcher.js";



let oOrderDispatcher = new HttpMethodDispatcher();
oOrderDispatcher.setPutDispatcher(new OrderPutDispatcher());
oOrderDispatcher.setDeleteDispatcher(new OrderDeleteDispatcher());
oOrderDispatcher.setPatchDispatcher(new OrderPatchDispatcher());
oOrderDispatcher.setGetDispatcher(new OrderGetDispatcher());

export default oOrderDispatcher;
