import { Router } from "express";
import { TotHandler } from "../feature/ToT/handler/crud";
import { authenticate } from "../middleware/authenticate";
import upload from "../middleware/multer";

const router = Router();
const totHandler = new TotHandler();

// Public routes (tidak perlu login)
router.get("/", totHandler.getAllToT);
router.get("/:id", totHandler.getTotById);

// Protected routes (perlu login admin)
router.post("/", authenticate, upload.single("image"), totHandler.createToT);
router.put("/:id", authenticate, upload.single("image"), totHandler.updateToT);
router.delete("/:id", authenticate, totHandler.deleteToT);

export default router;
