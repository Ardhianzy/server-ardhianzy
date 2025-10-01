import prisma from "../../../config/db";
import { Collected_meditations, Prisma } from "@prisma/client";
import {
  SlugGenerator,
  SEOMetaGenerator,
  UtilityFactory,
} from "../../../utils/slugify";

// Interface untuk pagination (Tidak ada perubahan)
interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

interface PaginatedResult<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

// --- UPDATED: tambahkan adminId agar bisa connect relasi ---
export interface CreateCollectedMeditationsData {
  image?: string; // NOTE: kalau kamu pakai multer, konversi ke URL di service sebelum kirim ke repo
  dialog: string;
  judul: string;
  meta_title?: string;
  meta_description?: string;
  is_published?: boolean;
  adminId: string; // <-- WAJIB (ambil dari req.user.admin_Id di handler)
}

export interface UpdateCollectedMeditationsData {
  image?: string;
  dialog?: string;
  judul?: string;
  slug?: string;
  meta_title?: string;
  meta_description?: string;
  is_published?: boolean;
}

export class CollectedMeditationsRepository {
  private slugGenerator = UtilityFactory.getSlugGenerator();
  private seoGenerator = UtilityFactory.getSEOGenerator();

  /**
   * Create a new Collected Meditations record (Admin only)
   */
  async createByAdmin(
    dataCollectedMeditations: CreateCollectedMeditationsData
  ): Promise<Collected_meditations> {
    try {
      const { adminId, ...pureData } = dataCollectedMeditations;
      if (!adminId) {
        throw new Error("Admin ID is required");
      }

      const slug = await this.slugGenerator.generateUniqueSlug(
        pureData.judul,
        "collected_meditations"
      );

      const seoMeta = this.seoGenerator.generateSEOMeta(
        pureData.judul,
        pureData.dialog
      );

      const newCollectedMeditations = await prisma.collected_meditations.create(
        {
          data: {
            ...pureData,
            slug,
            meta_title: pureData.meta_title ?? seoMeta.metaTitle,
            meta_description:
              pureData.meta_description ?? seoMeta.metaDescription,

            // === KUNCI: isi relasi admin ===
            admin: { connect: { id: adminId } },

            // Alternatif kalau mau pakai scalar langsung:
            // admin_id: adminId,
          },
        }
      );

      return newCollectedMeditations;
    } catch (error) {
      throw new Error(
        `Failed to create Collected Meditations: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Update Collected Meditations by ID (Admin only)
   */
  async updateById(
    id: string,
    dataCollectedMeditations: UpdateCollectedMeditationsData
  ): Promise<Collected_meditations> {
    try {
      let updateData = { ...dataCollectedMeditations };

      if (dataCollectedMeditations.judul) {
        updateData.slug = await this.slugGenerator.generateUniqueSlug(
          dataCollectedMeditations.judul,
          "collected_meditations",
          id
        );
      }

      if (dataCollectedMeditations.judul || dataCollectedMeditations.dialog) {
        const currentData = await prisma.collected_meditations.findUnique({
          where: { id },
        });
        if (currentData) {
          const judul = dataCollectedMeditations.judul ?? currentData.judul;
          const dialog = dataCollectedMeditations.dialog ?? currentData.dialog;
          const seoMeta = this.seoGenerator.generateSEOMeta(judul, dialog);

          if (!dataCollectedMeditations.meta_title) {
            updateData.meta_title = seoMeta.metaTitle;
          }
          if (!dataCollectedMeditations.meta_description) {
            updateData.meta_description = seoMeta.metaDescription;
          }
        }
      }

      const updatedCollectedMeditations =
        await prisma.collected_meditations.update({
          where: { id },
          data: updateData,
        });

      return updatedCollectedMeditations;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw new Error("Collected Meditations not found");
        }
      }
      throw new Error(
        `Failed to update Collected Meditations: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Delete Collected Meditations by ID (Admin only)
   */
  async deleteById(id: string): Promise<Collected_meditations> {
    try {
      const deletedCollectedMeditations =
        await prisma.collected_meditations.delete({
          where: { id },
        });

      return deletedCollectedMeditations;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw new Error("Collected Meditations not found");
        }
        if (error.code === "P2003") {
          throw new Error(
            "Cannot delete Collected Meditations: it has related records"
          );
        }
      }
      throw new Error(
        `Failed to delete Collected Meditations: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Get all Collected Meditations records with pagination
   */
  async getAll(
    paginationParams: PaginationParams = {}
  ): Promise<PaginatedResult<Collected_meditations>> {
    try {
      const page = Math.max(1, paginationParams.page ?? 1);
      const limit = Math.min(100, Math.max(1, paginationParams.limit ?? 10));
      const skip = (page - 1) * limit;
      const sortBy = paginationParams.sortBy ?? "created_at";
      const sortOrder = paginationParams.sortOrder ?? "desc";

      const [data, total] = await Promise.all([
        prisma.collected_meditations.findMany({
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder },
          // (opsional) include admin agar bisa lihat pemilik:
          // include: { admin: { select: { id: true, username: true } } },
        }),
        prisma.collected_meditations.count(),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        data,
        pagination: {
          total,
          page,
          limit,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      };
    } catch (error) {
      throw new Error(
        `Failed to get Collected Meditations list: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Get Collected Meditations by judul
   */
  async getByJudul(judul: string): Promise<Collected_meditations | null> {
    try {
      const collectedMeditations = await prisma.collected_meditations.findFirst(
        {
          where: { judul },
        }
      );
      return collectedMeditations;
    } catch (error) {
      throw new Error(
        `Failed to get Collected Meditations by judul: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async getById(id: string): Promise<Collected_meditations | null> {
    try {
      const meditation = await prisma.collected_meditations.findUnique({
        where: { id },
        // include: { admin: true }, // opsional
      });
      return meditation;
    } catch (error) {
      throw new Error(
        `Failed to get Collected Meditations by ID: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }
}
