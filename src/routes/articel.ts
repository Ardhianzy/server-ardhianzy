import { Router } from "express";
import { ArticleHandler } from "../feature/articel/handler/crud_articel";
import { authenticate } from "../middleware/auth.middleware";
import upload from "../middleware/multer";

const router = Router();
const articleHandler = new ArticleHandler();

// Create Article (Admin only)
router.post(
  "/",
  authenticate,
  upload.single("image"),
  articleHandler.createByAdmin
);

// Get all Article with pagination
router.get("/", articleHandler.getAll);

// Get Article by title
router.get("/title/:title", articleHandler.getByTitle);

// Update Article by ID (Admin only)
router.put(
  "/:id",
  authenticate,
  upload.single("image"),
  articleHandler.updateById
);

// Delete Article by ID (Admin only)
router.delete("/:id", authenticate, articleHandler.deleteById);

export default router;
