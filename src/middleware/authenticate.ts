import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";

interface JwtPayload {
  admin_Id: string;
  username: string;
  iat?: number;
  exp?: number;
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      res
        .status(401)
        .json({ success: false, message: "Access token required" });
      return;
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      res
        .status(500)
        .json({ success: false, message: "Server configuration error" });
      return;
    }

    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;

    req.user = {
      admin_Id: decoded.admin_Id,
      username: decoded.username,
    };

    next();
  } catch {
    res
      .status(401)
      .json({ success: false, message: "Invalid or expired token" });
  }
};
