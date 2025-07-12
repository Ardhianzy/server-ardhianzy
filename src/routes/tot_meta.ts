import { Router } from "express";
import { ToTMetaHandler } from "../feature/ToT_meta/handler/crud";
import { authenticate } from "../middleware/authenticate"; // Update path ini

const router = Router();
const totMetaHandler = new ToTMetaHandler();

// Create ToT Meta (Admin only)
router.post("/", authenticate, totMetaHandler.createByAdmin);

// Get all ToT Meta with pagination
router.get("/", totMetaHandler.getAll);

// Get ToT Meta by ToT ID
router.get("/tot/:totId", totMetaHandler.getByToTId);

// Get ToT Meta by ID
router.get("/:id", totMetaHandler.getById);

// Update ToT Meta by ID (Admin only)
router.put("/:id", authenticate, totMetaHandler.updateById);

// Delete ToT Meta by ID (Admin only)
router.delete("/:id", authenticate, totMetaHandler.deleteById);

export default router;
