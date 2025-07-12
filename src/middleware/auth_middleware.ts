// middleware/authenticate.ts
import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Access token required",
      });
      return;
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      res.status(500).json({
        success: false,
        message: "Server configuration error",
      });
      return;
    }

    const decoded = jwt.verify(token, jwtSecret) as {
      admin_Id: number;
      username: string;
    };

    req.user = decoded; // Sekarang sudah compatible
    req.admin = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};
