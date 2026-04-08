import express from "express";
import { getAll, create, remove } from "../controllers/workerAssignment.controller.js";
import { protect, authorize } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  idParamValidation,
  queryFilterValidation,
  workerAssignmentValidation,
} from "../validations/domain.validation.js";
const router = express.Router();
router.use(protect);
router
  .route("/")
  .get(validate(queryFilterValidation), getAll)
  .post(authorize("Admin", "Project_Manager", "Site_Engineer"), validate(workerAssignmentValidation), create);
router.delete("/:id", authorize("Admin", "Project_Manager", "Site_Engineer"), validate(idParamValidation), remove);
export default router;
