import { Router } from "express";

import authRoutes from "./auth_routes";
import totRoutes from "./ToT_routes";
import shopRoutes from "./shop";
import glosariumRoutes from "./glosarium";
import researchRoutes from "./research";
import collectedRoutes from "./collected";
import articelRoutes from "./articel";
import totMetaRoutes from "./tot_meta";

const router = Router();

router.use("/auth", authRoutes);
router.use("/ToT", totRoutes);
// router.use("/shop", shopRoutes);
// router.use("/glosarium", glosariumRoutes);
// router.use("/research", researchRoutes);
// router.use("/collected", collectedRoutes);
// router.use("/articel", articelRoutes);
// router.use("/tot-meta", totMetaRoutes);

export default router;
