import { HttpMethodDispatcher } from "../../modules/HttpDispatcher.js";
import OrderPutDispatcher from "./order/OrderPutDispatcher.js";



let oOrderDispatcher = new HttpMethodDispatcher();
oOrderDispatcher.setPutDispatcher(new OrderPutDispatcher());

export default oOrderDispatcher;
