import express from "express";
import {
  activateUser,
  createUser,
  deactivateUser,
  getUserById,
  listUsers,
  updateUser,
} from "../controllers/user.controller.js";
import { authorize, protect } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { adminCreateUserValidation } from "../validations/auth.validation.js";
import { idParamValidation, queryFilterValidation, userUpdateValidation } from "../validations/domain.validation.js";

const router = express.Router();

router.use(protect, authorize("Admin"));

router.get("/", validate(queryFilterValidation), listUsers);
router.post("/", validate(adminCreateUserValidation), createUser);
router.get("/:id", validate(idParamValidation), getUserById);
router.put("/:id", validate(userUpdateValidation), updateUser);
router.patch("/:id/deactivate", validate(idParamValidation), deactivateUser);
router.patch("/:id/activate", validate(idParamValidation), activateUser);

export default router;
