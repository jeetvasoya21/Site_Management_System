import express from "express";
import { getAll, getById, create, update, remove } from "../controllers/vendor.controller.js";
import { protect, authorize } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  idParamValidation,
  queryFilterValidation,
  vendorUpdateValidation,
  vendorValidation,
} from "../validations/domain.validation.js";
const router = express.Router();
router.use(protect);
router
  .route("/")
  .get(validate(queryFilterValidation), getAll)
  .post(authorize("Admin", "Project_Manager", "Storekeeper"), validate(vendorValidation), create);
router
  .route("/:id")
  .get(validate(idParamValidation), getById)
  .put(authorize("Admin", "Project_Manager", "Storekeeper"), validate({ ...idParamValidation, ...vendorUpdateValidation }), update)
  .delete(authorize("Admin"), validate(idParamValidation), remove);
export default router;
