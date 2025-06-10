import prisma from "../config/db";
import { Admin } from "@prisma/client";
import bcrypt from "bcryptjs";

export class AdminAuthRepo {
  /**
   * Menambahkan admin baru ke dalam database.
   * @param adminData Data admin baru yang akan ditambahkan
   * @returns Admin yang berhasil ditambahkan
   */
  async register(adminData: {
    image?: string | null;
    first_name: string;
    last_name: string;
    username: string;
    password: string;
  }): Promise<Admin> {
    try {
      const hashedPassword = await bcrypt.hash(adminData.password, 12);
      return await prisma.admin.create({
        data: {
          image: adminData.image,
          first_name: adminData.first_name,
          last_name: adminData.last_name,
          username: adminData.username,
          password: hashedPassword,
        },
      });
    } catch (error: any) {
      if (error.code === "P2002" && error.meta?.target?.includes("username")) {
        throw new Error("Username already exists");
      }
      throw error;
    }
  }

  /**
   * Mencari admin berdasarkan username
   * @param username Username admin
   * @returns Admin yang ditemukan atau null
   */
  async findByUsername(username: string): Promise<Admin | null> {
    return prisma.admin.findUnique({
      where: { username },
    });
  }

  /**
   * Mendapatkan admin berdasarkan ID
   * @param id ID admin
   * @returns Admin yang ditemukan atau null
   */
  async getById(id: number): Promise<Admin | null> {
    return prisma.admin.findUnique({ where: { id } });
  }

  /**
   * Mengupdate data admin selain ID dan password
   * @param id ID admin yang akan diupdate
   * @param updateData Data admin yang akan diupdate
   * @returns Admin yang telah diperbarui
   */
  async updateAdmin(
    id: number,
    updateData: Partial<Omit<Admin, "id" | "password">>
  ): Promise<Admin> {
    const existingAdmin = await prisma.admin.findUnique({ where: { id } });
    if (!existingAdmin) {
      throw new Error("Admin not found");
    }

    return prisma.admin.update({
      where: { id },
      data: updateData,
    });
  }

  /**
   * Mengubah password admin
   * @param id ID admin
   * @param currentPassword Password lama
   * @param newPassword Password baru
   * @returns Admin yang passwordnya sudah diubah
   */
  async changePassword(
    id: number,
    currentPassword: string,
    newPassword: string
  ): Promise<Admin> {
    const admin = await prisma.admin.findUnique({ where: { id } });

    if (!admin) {
      throw new Error("Admin not found");
    }
    const isValid = await bcrypt.compare(currentPassword, admin.password);
    if (!isValid) {
      throw new Error("Current password is incorrect");
    }
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    return prisma.admin.update({
      where: { id },
      data: { password: hashedPassword },
    });
  }

  /**
   * Mendapatkan profil admin tanpa password
   * @param id ID admin yang terverifikasi
   * @returns Profil admin atau null
   */
  async getAdminProfile(id: number): Promise<Omit<Admin, "password"> | null> {
    return prisma.admin.findUnique({
      where: { id: id },
      select: {
        id: true,
        username: true,
        first_name: true,
        last_name: true,
        image: true,
      },
    });
  }
}
