// src/app.ts
import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import prisma from "./config/db";
import authRoutes from "./routes/auth_routes";
import totRoutes from "./routes/ToT_routes";
import shopRoutes from "./routes/shop";
import glosarium from "./routes/glosarium";
import research from "./routes/research";
import collected from "./routes/collected";
import articel from "./routes/articel";
import totMeta from "./routes/tot_meta";

const app: Application = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/ToT", totRoutes);
app.use("/api/shop", shopRoutes);
app.use("/api/glosarium", glosarium);
app.use("/api/research", research);
app.use("/api/collected", collected);
app.use("/api/articel", articel);
app.use("/api/tot-meta", totMeta);

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  res.status(500).json({ message: "Internal Server Error" });
});

// Test database connection
app.get("/test-db", async (_req: Request, res: Response) => {
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

// Root route
app.get("/", (_req: Request, res: Response) => {
  res.send("LISTEN AND SERVE YOUR BROWSER");
});

export default app;
