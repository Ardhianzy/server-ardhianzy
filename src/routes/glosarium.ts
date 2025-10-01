import { Router } from "express";
import { GlosariumHandler } from "../feature/glosarium/handler/crud_glo";
import { authenticate } from "../middleware/authenticate";

const router = Router();
const glosariumHandler = new GlosariumHandler();

router.post("/", authenticate, glosariumHandler.create.bind(glosariumHandler));

router.get("/", glosariumHandler.getAll.bind(glosariumHandler));

router.get(
  "/definition/:definition",
  glosariumHandler.getByDefinition.bind(glosariumHandler)
);

router.put(
  "/:id",
  authenticate,
  glosariumHandler.updateById.bind(glosariumHandler)
);

router.delete(
  "/:id",
  authenticate,
  glosariumHandler.deleteById.bind(glosariumHandler)
);

export default router;
