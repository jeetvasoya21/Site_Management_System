import express from "express";
import { getAll, getById, create, update, addStock, remove } from "../controllers/inventory.controller.js";
import { protect, authorize } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  idParamValidation,
  inventoryStockValidation,
  inventoryUpdateValidation,
  inventoryValidation,
  queryFilterValidation,
} from "../validations/domain.validation.js";
const router = express.Router();
router.use(protect);
router
  .route("/")
  .get(validate(queryFilterValidation), getAll)
  .post(authorize("Admin", "Project_Manager", "Site_Engineer", "Storekeeper"), validate(inventoryValidation), create);
router
  .route("/:id")
  .get(validate(idParamValidation), getById)
  .put(authorize("Admin", "Project_Manager", "Site_Engineer", "Storekeeper"), validate({ ...idParamValidation, ...inventoryUpdateValidation }), update)
  .delete(authorize("Admin", "Project_Manager"), validate(idParamValidation), remove);
router.patch(
  "/:id/add-stock",
  authorize("Admin", "Project_Manager", "Site_Engineer", "Storekeeper"),
  validate({ ...idParamValidation, ...inventoryStockValidation }),
  addStock
);
export default router;
