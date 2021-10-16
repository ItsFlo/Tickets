import { HttpMethodDispatcher } from "../../modules/HttpDispatcher.js";
import ItemDeleteDispatcher from "./item/ItemDeleteDispatcher.js";
import ItemGetDispatcher from "./item/ItemGetDispatcher.js";
import ItemPatchDispatcher from "./item/ItemPatchDispatcher.js";
import ItemPutDispatcher from "./item/ItemPutDispatcher.js";



let oItemDispatcher = new HttpMethodDispatcher();
oItemDispatcher.setPutDispatcher(new ItemPutDispatcher());
oItemDispatcher.setDeleteDispatcher(new ItemDeleteDispatcher());
oItemDispatcher.setPatchDispatcher(new ItemPatchDispatcher());
oItemDispatcher.setGetDispatcher(new ItemGetDispatcher());

export default oItemDispatcher;
