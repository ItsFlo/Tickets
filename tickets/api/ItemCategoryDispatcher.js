import { HttpMethodDispatcher } from "../../modules/HttpDispatcher.js";
import ItemCategoryDeleteDispatcher from "./itemCategory/ItemCategoryDeleteDispatcher.js";
import ItemCategoryGetDispatcher from "./itemCategory/ItemCategoryGetDispatcher.js";
import ItemCategoryPatchDispatcher from "./itemCategory/ItemCategoryPatchDispatcher.js";
import ItemCategoryPutDispatcher from "./itemCategory/ItemCategoryPutDispatcher.js";



let itemCategoryDispatcher = new HttpMethodDispatcher();
itemCategoryDispatcher.setPutDispatcher(new ItemCategoryPutDispatcher());
itemCategoryDispatcher.setDeleteDispatcher(new ItemCategoryDeleteDispatcher());
itemCategoryDispatcher.setPatchDispatcher(new ItemCategoryPatchDispatcher());
itemCategoryDispatcher.setGetDispatcher(new ItemCategoryGetDispatcher());

export default itemCategoryDispatcher;
