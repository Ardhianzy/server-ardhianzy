import { Request, Response } from "express";
import { AdminAuthService } from "./auth_service";

// Extend Request dengan declaration merging untuk menghindari konflik
declare global {
  namespace Express {
    interface Request {
      user?: {
        admin_Id: string;
        username: string;
      };
    }
  }
}

// Interface untuk request dengan file upload
interface RequestWithFile extends Request {
  file?: Express.Multer.File; // Untuk single file upload
}

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export class AuthController {
  private adminAuthService: AdminAuthService;

  constructor() {
    this.adminAuthService = new AdminAuthService();
  }

  /**
   * Register Admin
   * @param req
   * @param res
   */
  public register = async (
    req: RequestWithFile,
    res: Response
  ): Promise<void> => {
    try {
      // Validasi input
      const { first_name, last_name, username, password } = req.body;

      if (!first_name?.trim()) {
        res.status(400).json({
          success: false,
          message: "First name is required",
        } as ApiResponse);
        return;
      }

      if (!last_name?.trim()) {
        res.status(400).json({
          success: false,
          message: "Last name is required",
        } as ApiResponse);
        return;
      }

      if (!username?.trim()) {
        res.status(400).json({
          success: false,
          message: "Username is required",
        } as ApiResponse);
        return;
      }

      if (!password || password.length < 8) {
        res.status(400).json({
          success: false,
          message: "Password must be at least 8 characters",
        } as ApiResponse);
        return;
      }

      const adminData = {
        image: req.file, // File dari multer middleware
        first_name: first_name.trim(),
        last_name: last_name.trim(),
        username: username.trim().toLowerCase(),
        password,
      };

      const newAdmin = await this.adminAuthService.register(adminData);

      // Jangan return password dalam response
      const { password: _, ...adminResponse } = newAdmin;

      res.status(201).json({
        success: true,
        message: "Admin registered successfully",
        data: adminResponse,
      } as ApiResponse);
    } catch (err) {
      console.error("Register error:", err);

      if (err instanceof Error) {
        // Handle specific errors
        if (err.message.includes("Username already exists")) {
          res.status(409).json({
            success: false,
            message: "Username already exists",
          } as ApiResponse);
        } else if (err.message.includes("Failed to upload image")) {
          res.status(400).json({
            success: false,
            message: "Failed to upload image. Please try again.",
          } as ApiResponse);
        } else {
          res.status(400).json({
            success: false,
            message: err.message,
          } as ApiResponse);
        }
      } else {
        res.status(500).json({
          success: false,
          message: "Internal server error",
        } as ApiResponse);
      }
    }
  };

  /**
   * Login Admin
   * @param req
   * @param res
   */
  public login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { username, password } = req.body;

      // Validasi input
      if (!username?.trim()) {
        res.status(400).json({
          success: false,
          message: "Username is required",
        } as ApiResponse);
        return;
      }

      if (!password?.trim()) {
        res.status(400).json({
          success: false,
          message: "Password is required",
        } as ApiResponse);
        return;
      }

      const result = await this.adminAuthService.login(
        username.trim().toLowerCase(),
        password
      );

      res.status(200).json({
        success: true,
        message: "Login successful",
        data: {
          admin: result.admin,
          token: result.token,
          expiresIn: "24h",
        },
      } as ApiResponse);
    } catch (err) {
      console.error("Login error:", err);

      if (err instanceof Error) {
        if (err.message.includes("Invalid credentials")) {
          res.status(401).json({
            success: false,
            message: "Invalid username or password",
          } as ApiResponse);
        } else {
          res.status(400).json({
            success: false,
            message: err.message,
          } as ApiResponse);
        }
      } else {
        res.status(500).json({
          success: false,
          message: "Internal server error",
        } as ApiResponse);
      }
    }
  };

  /**
   * Change Password (memerlukan otentikasi)
   * @param req
   * @param res
   */
  public changePassword = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const adminId = req.user?.admin_Id;

      if (!adminId) {
        res.status(401).json({
          success: false,
          message: "Authentication required",
        } as ApiResponse);
        return;
      }

      const { currentPassword, newPassword } = req.body;

      // Validasi input
      if (!currentPassword) {
        res.status(400).json({
          success: false,
          message: "Current password is required",
        } as ApiResponse);
        return;
      }

      if (!newPassword || newPassword.length < 8) {
        res.status(400).json({
          success: false,
          message: "New password must be at least 8 characters",
        } as ApiResponse);
        return;
      }

      if (currentPassword === newPassword) {
        res.status(400).json({
          success: false,
          message: "New password must be different from current password",
        } as ApiResponse);
        return;
      }

      await this.adminAuthService.changePassword(
        adminId,
        currentPassword,
        newPassword
      );

      res.status(200).json({
        success: true,
        message: "Password changed successfully",
      } as ApiResponse);
    } catch (err) {
      console.error("Change password error:", err);

      if (err instanceof Error) {
        if (err.message.includes("Admin not found")) {
          res.status(404).json({
            success: false,
            message: "Admin not found",
          } as ApiResponse);
        } else if (err.message.includes("Current password is incorrect")) {
          res.status(400).json({
            success: false,
            message: "Current password is incorrect",
          } as ApiResponse);
        } else {
          res.status(400).json({
            success: false,
            message: err.message,
          } as ApiResponse);
        }
      } else {
        res.status(500).json({
          success: false,
          message: "Internal server error",
        } as ApiResponse);
      }
    }
  };

  /**
   * Get Admin Profile (memerlukan otentikasi)
   * @param req
   * @param res
   */
  public getAdminProfile = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const adminId = req.user?.admin_Id;

      if (!adminId) {
        res.status(401).json({
          success: false,
          message: "Authentication required",
        } as ApiResponse);
        return;
      }

      const adminProfile = await this.adminAuthService.getAdminProfile(adminId);

      if (!adminProfile) {
        res.status(404).json({
          success: false,
          message: "Admin profile not found",
        } as ApiResponse);
        return;
      }

      res.status(200).json({
        success: true,
        message: "Profile retrieved successfully",
        data: adminProfile,
      } as ApiResponse);
    } catch (err) {
      console.error("Get profile error:", err);

      if (err instanceof Error) {
        res.status(400).json({
          success: false,
          message: err.message,
        } as ApiResponse);
      } else {
        res.status(500).json({
          success: false,
          message: "Internal server error",
        } as ApiResponse);
      }
    }
  };

  /**
   * Update Admin Profile (memerlukan otentikasi)
   * @param req
   * @param res
   */
  public updateProfile = async (
    req: RequestWithFile,
    res: Response
  ): Promise<void> => {
    try {
      const adminId = req.user?.admin_Id;

      if (!adminId) {
        res.status(401).json({
          success: false,
          message: "Authentication required",
        } as ApiResponse);
        return;
      }

      const { first_name, last_name, username } = req.body;
      const updateData: any = {};

      // Validasi dan sanitasi input
      if (first_name !== undefined) {
        if (!first_name.trim()) {
          res.status(400).json({
            success: false,
            message: "First name cannot be empty",
          } as ApiResponse);
          return;
        }
        updateData.first_name = first_name.trim();
      }

      if (last_name !== undefined) {
        if (!last_name.trim()) {
          res.status(400).json({
            success: false,
            message: "Last name cannot be empty",
          } as ApiResponse);
          return;
        }
        updateData.last_name = last_name.trim();
      }

      if (username !== undefined) {
        if (!username.trim()) {
          res.status(400).json({
            success: false,
            message: "Username cannot be empty",
          } as ApiResponse);
          return;
        }
        updateData.username = username.trim().toLowerCase();
      }

      const updatedAdmin = await this.adminAuthService.updateProfile(
        adminId,
        updateData,
        req.file // Image file jika ada
      );

      // Jangan return password
      const { password: _, ...adminResponse } = updatedAdmin;

      res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        data: adminResponse,
      } as ApiResponse);
    } catch (err) {
      console.error("Update profile error:", err);

      if (err instanceof Error) {
        if (err.message.includes("Username already exists")) {
          res.status(409).json({
            success: false,
            message: "Username already exists",
          } as ApiResponse);
        } else if (err.message.includes("Admin not found")) {
          res.status(404).json({
            success: false,
            message: "Admin not found",
          } as ApiResponse);
        } else {
          res.status(400).json({
            success: false,
            message: err.message,
          } as ApiResponse);
        }
      } else {
        res.status(500).json({
          success: false,
          message: "Internal server error",
        } as ApiResponse);
      }
    }
  };

  /**
   * Logout Admin (optional - untuk invalidate token di client)
   * @param req
   * @param res
   */
  public logout = async (req: Request, res: Response): Promise<void> => {
    try {
      // Dalam implementasi JWT stateless, logout biasanya handled di client
      // Tapi kita bisa log atau implement token blacklist jika diperlukan

      res.status(200).json({
        success: true,
        message: "Logout successful",
      } as ApiResponse);
    } catch (err) {
      console.error("Logout error:", err);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      } as ApiResponse);
    }
  };
}
