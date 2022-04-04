import { HttpMethodDispatcher } from "../../modules/HttpDispatcher.js";
import OrderItemGetDispatcher from "./orderItem/OrderItemGetDispatcher.js";



let orderItemDispatcher = new HttpMethodDispatcher();
orderItemDispatcher.setGetDispatcher(new OrderItemGetDispatcher());

export default orderItemDispatcher;
