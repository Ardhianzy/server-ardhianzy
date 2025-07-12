import { Router } from "express";
import { ShopHandler } from "../feature/shop/handler/crud_shop";
import { authenticate } from "../middleware/auth_middleware";
import upload from "../middleware/multer";

const router = Router();
const shopHandler = new ShopHandler();

router.post(
  "/",
  authenticate,
  upload.single("image"),
  shopHandler.create.bind(shopHandler)
);

router.get("/title/:title", shopHandler.getByTitle.bind(shopHandler));

router.get("/", shopHandler.getAll.bind(shopHandler));

router.delete("/:id", authenticate, shopHandler.deleteById.bind(shopHandler));

router.put(
  "/:id",
  authenticate,
  upload.single("image"),
  shopHandler.updateById.bind(shopHandler)
);

export default router;
