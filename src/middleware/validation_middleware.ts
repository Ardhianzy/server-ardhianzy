import { body, param, validationResult } from "express-validator";
import rateLimit from "express-rate-limit";
// Middleware untuk menangani hasil validasi
export const handleValidationErrors = (
  req: any,
  res: any,
  next: () => void
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array(),
    });
  }
  next();
};

// Validasi untuk registrasi admin
export const validateAdminRegistration = [
  body("first_name")
    .notEmpty()
    .withMessage("First name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("First name must be between 2 and 50 characters"),

  body("last_name")
    .notEmpty()
    .withMessage("Last name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Last name must be between 2 and 50 characters"),

  body("username")
    .notEmpty()
    .withMessage("Username is required")
    .isLength({ min: 3, max: 30 })
    .withMessage("Username must be between 3 and 30 characters")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Username can only contain letters, numbers, and underscores"),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Password must contain at least one lowercase letter, one uppercase letter, and one number"
    ),

  body("image").optional().isString().withMessage("Image must be a string"),

  handleValidationErrors,
];

// Validasi untuk login admin
export const validateAdminLogin = [
  body("username").notEmpty().withMessage("Username is required"),
  body("password").notEmpty().withMessage("Password is required"),
  handleValidationErrors,
];

// Validasi untuk update admin profile
export const validateAdminUpdate = [
  body("first_name")
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage("First name must be between 2 and 50 characters"),
  body("last_name")
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage("Last name must be between 2 and 50 characters"),
  body("username")
    .optional()
    .isLength({ min: 3, max: 30 })
    .withMessage("Username must be between 3 and 30 characters")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Username can only contain letters, numbers, and underscores"),
  body("image").optional().isString().withMessage("Image must be a string"),
  handleValidationErrors,
];

// Validasi untuk change password
export const validatePasswordChange = [
  body("currentPassword")
    .notEmpty()
    .withMessage("Current password is required"),
  body("newPassword")
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "New password must contain at least one lowercase letter, one uppercase letter, and one number"
    ),
  body("confirmPassword").custom((value: any, { req }: any) => {
    if (value !== req.body.newPassword) {
      throw new Error("Password confirmation does not match new password");
    }
    return true;
  }),
  handleValidationErrors,
];

// Validasi untuk reset password
export const validatePasswordReset = [
  body("email")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),
  handleValidationErrors,
];

// Validasi untuk confirm reset password
export const validatePasswordResetConfirm = [
  body("token").notEmpty().withMessage("Reset token is required"),
  body("newPassword")
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "New password must contain at least one lowercase letter, one uppercase letter, and one number"
    ),
  handleValidationErrors,
];

// Validasi umum untuk ID parameter (PostgreSQL Integer)
export const validateId = [
  body("id")
    .optional()
    .isInt({ min: 1 })
    .withMessage("ID must be a positive integer"),
  handleValidationErrors,
];

// Validasi untuk parameter ID di URL
export const validateParamId = [
  param("id").isInt({ min: 1 }).withMessage("ID must be a positive integer"),
  handleValidationErrors,
];

// Bikin limiter khusus login, misal max 5 request per 10 menit per IP
export const rateLimitLogin = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 menit
  max: 5,
  message: {
    success: false,
    message: "Too many login attempts. Please try again after 10 minutes.",
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
