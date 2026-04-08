import express from "express";
import { getAll, create } from "../controllers/materialIssue.controller.js";
import { protect, authorize } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { materialIssueValidation } from "../validations/domain.validation.js";

const router = express.Router();

router.use(protect);
router
  .route("/")
  .get(getAll)
  .post(
    authorize("Admin", "Project_Manager", "Site_Engineer", "Storekeeper"),
    validate(materialIssueValidation),
    create
  );

export default router;
