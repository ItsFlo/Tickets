import { HttpMethodDispatcher } from "../../modules/HttpDispatcher.js";
import OrderPutDispatcher from "./order/OrderPutDispatcher.js";
import OrderDeleteDispatcher from "./order/OrderDeleteDispatcher.js";
import OrderPatchDispatcher from "./order/OrderPatchDispatcher.js";
import OrderGetDispatcher from "./order/OrderGetDispatcher.js";



let orderDispatcher = new HttpMethodDispatcher();
orderDispatcher.setPutDispatcher(new OrderPutDispatcher());
orderDispatcher.setDeleteDispatcher(new OrderDeleteDispatcher());
orderDispatcher.setPatchDispatcher(new OrderPatchDispatcher());
orderDispatcher.setGetDispatcher(new OrderGetDispatcher());

export default orderDispatcher;
