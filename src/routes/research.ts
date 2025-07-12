import { Router } from "express";
import { ResearchHandler } from "../feature/research/handler/crud_res";
import { authenticate } from "../middleware/authenticate";
import upload from "../middleware/multer";

const router = Router();
const researchHandler = new ResearchHandler();

// Create Research (Admin only)
router.post(
  "/",
  authenticate,
  upload.single("image"),
  researchHandler.createByAdmin
);

// Get all Research with pagination
router.get("/", researchHandler.getAll);

// Get Research by research title
router.get("/title/:researchTitle", researchHandler.getByResearchTitle);

// Update Research by ID (Admin only)
router.put(
  "/:id",
  authenticate,
  upload.single("image"),
  researchHandler.updateById
);

// Delete Research by ID (Admin only)
router.delete("/:id", authenticate, researchHandler.deleteById);

export default router;
