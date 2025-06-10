import bcrypt from "bcryptjs";
import { AdminAuthRepo } from "./auth.repo";
import { Admin } from "@prisma/client";
import imagekit from "../libs/imageKit";
import jwt from "jsonwebtoken";
import path from "path";

export class AdminAuthService {
  private repo: AdminAuthRepo;

  constructor() {
    this.repo = new AdminAuthRepo();
  }

  // Register Admin
  async register(adminData: {
    image?: Express.Multer.File;
    first_name: string;
    last_name: string;
    username: string;
    password: string;
  }): Promise<Admin> {
    // Validasi input
    if (!adminData.username?.trim()) {
      throw new Error("Username is required");
    }
    if (!adminData.password || adminData.password.length < 8) {
      throw new Error("Password must be at least 8 characters");
    }

    let imageUrl: string | null = null;

    // Upload image jika ada
    if (adminData.image) {
      try {
        const fileBase64 = adminData.image.buffer.toString("base64");
        const response = await imagekit.upload({
          fileName: Date.now() + path.extname(adminData.image.originalname),
          file: fileBase64,
          folder: "Ardianzy/admins",
        });
        imageUrl = response.url;
      } catch (error) {
        throw new Error("Failed to upload image");
      }
    }
    return this.repo.register({
      image: imageUrl,
      first_name: adminData.first_name,
      last_name: adminData.last_name,
      username: adminData.username,
      password: adminData.password,
    });
  }

  // Login Admin
  async login(
    username: string,
    password: string
  ): Promise<{ admin: Omit<Admin, "password">; token: string }> {
    // Validasi input
    if (!username?.trim() || !password?.trim()) {
      throw new Error("Username and password are required");
    }

    const admin = await this.repo.findByUsername(username);
    if (!admin) {
      throw new Error("Invalid credentials");
    }

    const isValid = await bcrypt.compare(password, admin.password);
    if (!isValid) {
      throw new Error("Invalid credentials");
    }

    // Validasi JWT_SECRET
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error("JWT_SECRET is not configured");
    }

    // Generate token JWT
    const token = jwt.sign(
      {
        admin_Id: admin.id,
        username: admin.username, // Lebih konsisten daripada email
      },
      jwtSecret,
      { expiresIn: "24h" }
    );

    // Jangan return password
    const { password: _, ...adminWithoutPassword } = admin;
    return { admin: adminWithoutPassword, token };
  }

  // Change password
  async changePassword(
    id: number,
    currentPassword: string,
    newPassword: string
  ): Promise<Admin> {
    // Validasi input
    if (!currentPassword || !newPassword) {
      throw new Error("Current and new passwords are required");
    }
    if (newPassword.length < 8) {
      throw new Error("New password must be at least 8 characters");
    }
    if (currentPassword === newPassword) {
      throw new Error("New password must be different from current password");
    }

    // Gunakan method repository yang sudah ada - tidak perlu hash di sini
    return this.repo.changePassword(id, currentPassword, newPassword);
  }

  /**
   * Mendapatkan profil admin tanpa password
   * @param admin_Id ID admin yang terverifikasi
   * @returns Profil admin atau null
   */
  async getAdminProfile(
    admin_Id: number
  ): Promise<Omit<Admin, "password"> | null> {
    if (!admin_Id || admin_Id <= 0) {
      throw new Error("Valid admin ID is required");
    }

    return this.repo.getAdminProfile(admin_Id);
  }

  /**
   * Update admin profile (tidak termasuk password)
   * @param id ID admin
   * @param updateData Data yang akan diupdate
   * @param imageFile File gambar baru (optional)
   * @returns Admin yang sudah diupdate
   */
  async updateProfile(
    id: number,
    updateData: {
      first_name?: string;
      last_name?: string;
      username?: string;
    },
    imageFile?: Express.Multer.File
  ): Promise<Admin> {
    let imageUrl: string | undefined;

    // Upload image baru jika ada
    if (imageFile) {
      try {
        const fileBase64 = imageFile.buffer.toString("base64");
        const response = await imagekit.upload({
          fileName: Date.now() + path.extname(imageFile.originalname),
          file: fileBase64,
          folder: "Ardianzy/admins",
        });
        imageUrl = response.url;
      } catch (error) {
        throw new Error("Failed to upload image");
      }
    }

    return this.repo.updateAdmin(id, {
      ...updateData,
      ...(imageUrl && { image: imageUrl }),
    });
  }

  /**
   * Verify JWT token
   * @param token JWT token
   * @returns Decoded token payload
   */
  verifyToken(token: string): { admin_Id: number; username: string } {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error("JWT_SECRET is not configured");
    }

    try {
      const decoded = jwt.verify(token, jwtSecret) as {
        admin_Id: number;
        username: string;
      };
      return decoded;
    } catch (error) {
      throw new Error("Invalid or expired token");
    }
  }
}
