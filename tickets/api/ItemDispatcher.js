import { HttpMethodDispatcher } from "../../modules/HttpDispatcher.js";
import ItemDeleteDispatcher from "./item/ItemDeleteDispatcher.js";
import ItemGetDispatcher from "./item/ItemGetDispatcher.js";
import ItemPatchDispatcher from "./item/ItemPatchDispatcher.js";
import ItemPutDispatcher from "./item/ItemPutDispatcher.js";



let itemDispatcher = new HttpMethodDispatcher();
itemDispatcher.setPutDispatcher(new ItemPutDispatcher());
itemDispatcher.setDeleteDispatcher(new ItemDeleteDispatcher());
itemDispatcher.setPatchDispatcher(new ItemPatchDispatcher());
itemDispatcher.setGetDispatcher(new ItemGetDispatcher());

export default itemDispatcher;
