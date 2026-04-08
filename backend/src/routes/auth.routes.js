import express from "express";
import {
  changePassword,
  getMe,
  login,
  logout,
  refreshToken,
  register,
  signup,
  updateProfile,
} from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  changePasswordValidation,
  loginValidation,
  registerValidation,
  updateProfileValidation,
} from "../validations/auth.validation.js";

const router = express.Router();

router.post("/register", validate(registerValidation), register);
router.post("/signup", validate(registerValidation), signup);
router.post("/login", validate(loginValidation), login);
router.post("/refresh-token", refreshToken);
router.post("/refresh", refreshToken);
router.post("/logout", logout);
router.get("/me", protect, getMe);
router.put("/profile", protect, validate(updateProfileValidation), updateProfile);
router.put("/change-password", protect, validate(changePasswordValidation), changePassword);

export default router;
