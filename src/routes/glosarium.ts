import { Router } from "express";
import { GlosariumHandler } from "../feature/glosarium/handler/crud_glo";
import { authenticate } from "../middleware/authenticate";

const router = Router();
const glosariumHandler = new GlosariumHandler();

// Create Glosarium (Admin only)
router.post(
  "/",
  authenticate,
  glosariumHandler.createByAdminId.bind(glosariumHandler)
);

// Get all Glosarium with pagination
router.get("/", glosariumHandler.getAll.bind(glosariumHandler));

// Get Glosarium by definition
router.get(
  "/definition/:definition",
  glosariumHandler.getByDefinition.bind(glosariumHandler)
);

// Update Glosarium by ID (Admin only)
router.put(
  "/:id",
  authenticate,
  glosariumHandler.updateById.bind(glosariumHandler)
);

// Delete Glosarium by ID (Admin only)
router.delete(
  "/:id",
  authenticate,
  glosariumHandler.deleteById.bind(glosariumHandler)
);

export default router;
