import express from "express";
import { getAll, create, update, remove, getProjectSummary, getCategorySummary } from "../controllers/finance.controller.js";
import { protect, authorize } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { financeMutationValidation } from "../validations/domain.validation.js";

const router = express.Router();

router.use(protect);
router.get("/project-summary", authorize("Admin", "Project_Manager"), getProjectSummary);
router.get("/category-summary", authorize("Admin", "Project_Manager"), getCategorySummary);
router
  .route("/")
  .get(getAll)
  .post(authorize("Admin", "Project_Manager"), validate(financeMutationValidation), create);
router
  .route("/:id")
  .put(authorize("Admin", "Project_Manager"), validate(financeMutationValidation), update)
  .delete(authorize("Admin", "Project_Manager"), remove);

export default router;
