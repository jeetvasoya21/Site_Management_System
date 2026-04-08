import express from "express";
import { getAll, record, getSalary } from "../controllers/attendance.controller.js";
import { protect, authorize } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { attendanceValidation } from "../validations/domain.validation.js";

const router = express.Router();

router.use(protect);
router
  .route("/")
  .get(getAll)
  .post(
    authorize("Admin", "Project_Manager", "Site_Engineer", "Storekeeper"),
    validate(attendanceValidation),
    record
  );
router.get("/salary", getSalary);

export default router;
