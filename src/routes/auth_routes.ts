import express from "express";
import upload from "../middleware/multer";
import { authenticate } from "../middleware/auth.middleware";
import { AuthController } from "../admin/auth_controller";
import { rateLimitLogin } from "../middleware/validation.middleware";
import {
  validateAdminRegistration,
  validateAdminLogin,
  validateAdminUpdate,
  validatePasswordChange,
} from "../middleware/validation.middleware";

const router = express.Router();
const authController = new AuthController();

// Public routes (tidak memerlukan authentication)
router.post(
  "/register",
  upload.single("image"),
  validateAdminRegistration, // ganti validateRegistration -> validateAdminRegistration
  authController.register
);

router.post(
  "/login",
  rateLimitLogin,
  validateAdminLogin, // ganti validateLogin -> validateAdminLogin
  authController.login
);

// Protected routes (memerlukan authentication)
router.put(
  "/change-password",
  authenticate,
  validatePasswordChange, // tambahkan validasi ganti password!
  authController.changePassword
);

router.get("/profile", authenticate, authController.getAdminProfile);

router.put(
  "/profile",
  authenticate,
  upload.single("image"),
  validateAdminUpdate, // validasi update profile
  authController.updateProfile
);

router.post("/logout", authenticate, authController.logout);

export default router;
