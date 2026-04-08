import express from "express";
import { getAll, create, updateDeliveryStatus, remove } from "../controllers/procurement.controller.js";
import { protect, authorize } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { procurementStatusValidation, procurementValidation } from "../validations/domain.validation.js";

const router = express.Router();

router.use(protect);
router
  .route("/")
  .get(getAll)
  .post(authorize("Admin", "Project_Manager", "Storekeeper"), validate(procurementValidation), create);
router.patch(
  "/:id/delivery-status",
  authorize("Admin", "Project_Manager", "Storekeeper"),
  validate(procurementStatusValidation),
  updateDeliveryStatus
);
router.delete("/:id", authorize("Admin", "Project_Manager"), remove);

export default router;
