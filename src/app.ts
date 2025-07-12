// src/app.ts

import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import prisma from "./config/db";
import mainRoutes from "./routes"; // <-- ini tinggal import satu

const app: Application = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api", mainRoutes); // semua route masuk sini

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
