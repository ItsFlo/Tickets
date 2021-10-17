import { HttpMethodDispatcher } from "../../modules/HttpDispatcher.js";
import ItemCategoryDeleteDispatcher from "./itemCategory/ItemCategoryDeleteDispatcher.js";
import ItemCategoryGetDispatcher from "./itemCategory/ItemCategoryGetDispatcher.js";
import ItemCategoryPatchDispatcher from "./itemCategory/ItemCategoryPatchDispatcher.js";
import ItemCategoryPutDispatcher from "./itemCategory/ItemCategoryPutDispatcher.js";



let oItemCategoryDispatcher = new HttpMethodDispatcher();
oItemCategoryDispatcher.setPutDispatcher(new ItemCategoryPutDispatcher());
oItemCategoryDispatcher.setDeleteDispatcher(new ItemCategoryDeleteDispatcher());
oItemCategoryDispatcher.setPatchDispatcher(new ItemCategoryPatchDispatcher());
oItemCategoryDispatcher.setGetDispatcher(new ItemCategoryGetDispatcher());

export default oItemCategoryDispatcher;
