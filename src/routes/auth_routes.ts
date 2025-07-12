import express from "express";
import upload from "../middleware/multer";
import { authenticate } from "../middleware/auth_middleware";
import { AuthController } from "../admin/auth_controller";
import { rateLimitLogin } from "../middleware/validation_middleware";
import {
  validateAdminRegistration,
  validateAdminLogin,
  validateAdminUpdate,
  validatePasswordChange,
} from "../middleware/validation_middleware";

const router = express.Router();
const authController = new AuthController();

router.post(
  "/register",
  upload.single("image"),
  validateAdminRegistration,
  authController.register
);

router.post("/login", rateLimitLogin, validateAdminLogin, authController.login);

router.put(
  "/change-password",
  authenticate,
  validatePasswordChange,
  authController.changePassword
);

router.get("/profile", authenticate, authController.getAdminProfile);

router.put(
  "/profile",
  authenticate,
  upload.single("image"),
  validateAdminUpdate,
  authController.updateProfile
);

router.post("/logout", authenticate, authController.logout);

export default router;
