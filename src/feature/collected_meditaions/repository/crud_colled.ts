import prisma from "../../../config/db";
import { Collected_meditations, Prisma } from "@prisma/client";
import {
  SlugGenerator,
  SEOMetaGenerator,
  UtilityFactory,
} from "../../../utils/slugify";

// Interface untuk pagination
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

export interface CreateCollectedMeditationsData {
  admin_id: number;
  image?: string;
  dialog: string;
  judul: string;
  meta_title?: string;
  meta_description?: string;
  is_published?: boolean;
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
   * @param dataCollectedMeditations - Data untuk membuat Collected Meditations baru
   * @returns Promise<Collected_meditations> - Record Collected Meditations yang baru dibuat
   */
  async createByAdmin(
    dataCollectedMeditations: CreateCollectedMeditationsData
  ): Promise<Collected_meditations> {
    try {
      // Generate unique slug from judul
      const slug = await this.slugGenerator.generateUniqueSlug(
        dataCollectedMeditations.judul,
        "glosarium"
      );

      // Generate SEO meta if not provided
      const seoMeta = this.seoGenerator.generateSEOMeta(
        dataCollectedMeditations.judul,
        dataCollectedMeditations.dialog
      );

      const newCollectedMeditations = await prisma.collected_meditations.create(
        {
          data: {
            ...dataCollectedMeditations,
            slug,
            meta_title:
              dataCollectedMeditations.meta_title || seoMeta.metaTitle,
            meta_description:
              dataCollectedMeditations.meta_description ||
              seoMeta.metaDescription,
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
   * @param id - ID dari Collected Meditations yang akan diupdate
   * @param dataCollectedMeditations - Data yang akan diupdate
   * @returns Promise<Collected_meditations> - Record Collected Meditations yang telah diupdate
   */
  async updateById(
    id: number,
    dataCollectedMeditations: UpdateCollectedMeditationsData
  ): Promise<Collected_meditations> {
    try {
      let updateData = { ...dataCollectedMeditations };

      // Generate new slug if judul is being updated
      if (dataCollectedMeditations.judul) {
        updateData.slug = await this.slugGenerator.generateUniqueSlug(
          dataCollectedMeditations.judul,
          "glosarium",
          id
        );
      }

      // Generate new SEO meta if judul or dialog is being updated
      if (dataCollectedMeditations.judul || dataCollectedMeditations.dialog) {
        const currentCollectedMeditations =
          await prisma.collected_meditations.findUnique({ where: { id } });
        if (currentCollectedMeditations) {
          const judul =
            dataCollectedMeditations.judul || currentCollectedMeditations.judul;
          const dialog =
            dataCollectedMeditations.dialog ||
            currentCollectedMeditations.dialog;
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
   * @param id - ID dari Collected Meditations yang akan dihapus
   * @returns Promise<Collected_meditations> - Record Collected Meditations yang telah dihapus
   */
  async deleteById(id: number): Promise<Collected_meditations> {
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
   * @param paginationParams - Parameters untuk pagination
   * @returns Promise<PaginatedResult<Collected_meditations>> - Data dengan informasi pagination
   */
  async getAll(
    paginationParams: PaginationParams = {}
  ): Promise<PaginatedResult<Collected_meditations>> {
    try {
      // Default values untuk pagination
      const page = Math.max(1, paginationParams.page || 1);
      const limit = Math.min(100, Math.max(1, paginationParams.limit || 10)); // Max 100 records per page
      const skip = (page - 1) * limit;
      const sortBy = paginationParams.sortBy || "id";
      const sortOrder = paginationParams.sortOrder || "desc";

      // Execute queries secara parallel untuk performa yang lebih baik
      const [data, total] = await Promise.all([
        prisma.collected_meditations.findMany({
          skip,
          take: limit,
          orderBy: {
            [sortBy]: sortOrder,
          },
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
   * @param judul - Judul dari Collected Meditations yang ingin diambil
   * @returns Promise<Collected_meditations | null> - Record Collected Meditations atau null jika tidak ditemukan
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
}
