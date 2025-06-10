// src/app.ts
import express, { Application } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import prisma from "./config/db";
import authRoutes from "./routes/auth_routes";
const app: Application = express();

app.use(cors());
app.use(bodyParser.json());

app.use("/api/auth", authRoutes);

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
