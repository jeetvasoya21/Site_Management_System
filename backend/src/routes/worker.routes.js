import express from "express";
import { getAll, getById, create, update, remove } from "../controllers/worker.controller.js";
import { protect, authorize } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  idParamValidation,
  queryFilterValidation,
  workerValidation,
  workerUpdateValidation,
} from "../validations/domain.validation.js";
const router = express.Router();
router.use(protect);
router
  .route("/")
  .get(validate(queryFilterValidation), getAll)
  .post(authorize("Admin", "Project_Manager", "Site_Engineer"), validate(workerValidation), create);
router
  .route("/:id")
  .get(validate(idParamValidation), getById)
  .put(authorize("Admin", "Project_Manager", "Site_Engineer"), validate({ ...idParamValidation, ...workerUpdateValidation }), update)
  .delete(authorize("Admin", "Project_Manager"), validate(idParamValidation), remove);
export default router;
