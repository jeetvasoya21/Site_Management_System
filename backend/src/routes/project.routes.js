import express from "express";
import { getAll, getById, create, update, remove, addMember, removeMember } from "../controllers/project.controller.js";
import { protect, authorize } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  idParamValidation,
  membershipParamValidation,
  projectMemberValidation,
  projectUpdateValidation,
  projectValidation,
  queryFilterValidation,
} from "../validations/domain.validation.js";

const router = express.Router();
router.use(protect);

router
  .route("/")
  .get(validate(queryFilterValidation), getAll)
  .post(authorize("Admin", "Project_Manager"), validate(projectValidation), create);
router
  .route("/:id")
  .get(validate(idParamValidation), getById)
  .put(authorize("Admin", "Project_Manager"), validate({ ...idParamValidation, ...projectUpdateValidation }), update)
  .delete(authorize("Admin"), validate(idParamValidation), remove);
router.post(
  "/:id/members",
  authorize("Admin", "Project_Manager"),
  validate({ ...idParamValidation, ...projectMemberValidation }),
  addMember
);
router.delete(
  "/:id/members/:memberId",
  authorize("Admin", "Project_Manager"),
  validate(membershipParamValidation),
  removeMember
);

export default router;
