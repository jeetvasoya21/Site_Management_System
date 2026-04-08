import express from "express";
import { getAll, getById, create, update, updateStatus, updateProgress, remove } from "../controllers/task.controller.js";
import { protect, authorize } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  idParamValidation,
  queryFilterValidation,
  taskUpdateValidation,
  taskProgressValidation,
  taskStatusValidation,
  taskValidation,
} from "../validations/domain.validation.js";

const router = express.Router();
router.use(protect);

router
  .route("/")
  .get(validate(queryFilterValidation), getAll)
  .post(authorize("Admin", "Project_Manager", "Site_Engineer"), validate(taskValidation), create);
router
  .route("/:id")
  .get(validate(idParamValidation), getById)
  .put(authorize("Admin", "Project_Manager", "Site_Engineer"), validate({ ...idParamValidation, ...taskUpdateValidation }), update)
  .delete(authorize("Admin", "Project_Manager"), validate(idParamValidation), remove);
router.patch(
  "/:id/status",
  authorize("Admin", "Project_Manager", "Site_Engineer"),
  validate({ ...idParamValidation, ...taskStatusValidation }),
  updateStatus
);
router.patch(
  "/:id/progress",
  authorize("Admin", "Project_Manager", "Site_Engineer"),
  validate({ ...idParamValidation, ...taskProgressValidation }),
  updateProgress
);

export default router;
