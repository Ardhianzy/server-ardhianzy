import { Router } from "express";
import { CollectedMeditationsHandler } from "../feature/collected_meditaions/handler/crud_handler";
import { authenticate } from "../middleware/authenticate";
import upload from "../middleware/multer";

const router = Router();
const collectedMeditationsHandler = new CollectedMeditationsHandler();

// Create Collected Meditations (Admin only)
router.post(
  "/",
  authenticate,
  upload.single("image"),
  collectedMeditationsHandler.createByAdmin
);

// Get all Collected Meditations with pagination
router.get("/", collectedMeditationsHandler.getAll);

// Get Collected Meditations by judul
router.get("/judul/:judul", collectedMeditationsHandler.getByJudul);

// Update Collected Meditations by ID (Admin only)
router.put(
  "/:id",
  authenticate,
  upload.single("image"),
  collectedMeditationsHandler.updateById
);

// Delete Collected Meditations by ID (Admin only)
router.delete("/:id", authenticate, collectedMeditationsHandler.deleteById);

export default router;
