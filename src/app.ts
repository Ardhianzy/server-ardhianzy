// src/app.ts
import express, { Application } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import prisma from "./config/db";
import authRoutes from "./routes/auth_routes";
import totRoutes from "../src/routes/ToT_routes";
import shopRoutes from "../src/routes/shop";
import glosarium from "../src/routes/glosarium";
import research from "../src/routes/research";
import collected from "../src/routes/collected";
import articel from "../src/routes/articel";
const app: Application = express();

app.use(cors());
app.use(bodyParser.json());

app.use("/api/auth", authRoutes);
app.use("/api/ToT", totRoutes);
app.use("/api/shop", shopRoutes);
app.use("/api/glosarium", glosarium);
app.use("/api/research", research);
app.use("/api/collected", collected);
app.use("/api/articel", articel);

app.use((err: any, req: any, res: any, next: any) => {
  console.error(err);
  res.status(500).json({ message: "Internal Server Error" });
});
app.get("/test-db", async (_req, res) => {
  try {
    const result = await prisma.$queryRaw`SELECT 1`;
    res.json({ success: true, result });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: "Unknown error occurred" });
    }
  }
});

app.get("/", (_req, res) => {
  res.send("LISTEN AND SERVE YOUR BROWSER");
});

export default app;
