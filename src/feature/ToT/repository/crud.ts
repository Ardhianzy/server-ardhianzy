import prisma from "../../../config/db";
import { ToT, Prisma } from "@prisma/client";
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

export interface CreateToTData {
  admin_id: number;
  image?: string;
  philosofer: string;
  geoorigin: string;
  detail_location: string;
  years: string;
  meta_title?: string;
  meta_description?: string;
  keywords?: string;
  is_published?: boolean;
}

export interface UpdateToTData {
  image?: string;
  philosofer?: string;
  geoorigin?: string;
  detail_location?: string;
  years?: string;
  slug?: string;
  meta_title?: string;
  meta_description?: string;
  keywords?: string;
  is_published?: boolean;
}

export class TotCrudRepo {
  private slugGenerator = UtilityFactory.getSlugGenerator();
  private seoGenerator = UtilityFactory.getSEOGenerator();

  /**
   * Create a new ToT record
   * @param dataToT - Data untuk membuat ToT baru
   * @returns Promise<ToT> - Record ToT yang baru dibuat
   */
  async create(dataToT: CreateToTData): Promise<ToT> {
    try {
      // Generate unique slug from philosofer name
      const slug = await this.slugGenerator.generateUniqueSlug(
        dataToT.philosofer,
        "tot"
      );

      // Generate SEO meta if not provided - combine philosofer and geoorigin for content
      const contentForSEO = `${dataToT.philosofer} from ${dataToT.geoorigin}, ${dataToT.detail_location} (${dataToT.years})`;
      const seoMeta = this.seoGenerator.generateSEOMeta(
        dataToT.philosofer,
        contentForSEO
      );

      const newToT = await prisma.toT.create({
        data: {
          ...dataToT,
          slug,
          meta_title: dataToT.meta_title || seoMeta.metaTitle,
          meta_description: dataToT.meta_description || seoMeta.metaDescription,
        },
      });
      return newToT;
    } catch (error) {
      throw new Error(
        `Failed to create ToT: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Get all ToT records with pagination
   * @param paginationParams - Parameters untuk pagination
   * @returns Promise<PaginatedResult<ToT>> - Data dengan informasi pagination
   */
  async getAll(
    paginationParams: PaginationParams = {}
  ): Promise<PaginatedResult<ToT>> {
    try {
      // Default values untuk pagination
      const page = Math.max(1, paginationParams.page || 1);
      const limit = Math.min(100, Math.max(1, paginationParams.limit || 10)); // Max 100 records per page
      const skip = (page - 1) * limit;
      const sortBy = paginationParams.sortBy || "id";
      const sortOrder = paginationParams.sortOrder || "desc";

      // Execute queries secara parallel untuk performa yang lebih baik
      const [data, total] = await Promise.all([
        prisma.toT.findMany({
          skip,
          take: limit,
          orderBy: {
            [sortBy]: sortOrder,
          },
        }),
        prisma.toT.count(),
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
        `Failed to get ToT list: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Get ToT by ID
   * @param id - ID dari ToT yang ingin diambil
   * @returns Promise<ToT | null> - Record ToT atau null jika tidak ditemukan
   */
  async getById(id: number): Promise<ToT | null> {
    try {
      const tot = await prisma.toT.findUnique({
        where: { id },
      });
      return tot;
    } catch (error) {
      throw new Error(
        `Failed to get ToT by ID: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Get ToT by philosofer name
   * @param philosofer - Philosofer name dari ToT yang ingin diambil
   * @returns Promise<ToT | null> - Record ToT atau null jika tidak ditemukan
   */
  async getByPhilosofer(philosofer: string): Promise<ToT | null> {
    try {
      const tot = await prisma.toT.findFirst({
        where: { philosofer },
      });
      return tot;
    } catch (error) {
      throw new Error(
        `Failed to get ToT by philosofer: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Update ToT by ID
   * @param id - ID dari ToT yang akan diupdate
   * @param dataToT - Data yang akan diupdate
   * @returns Promise<ToT> - Record ToT yang telah diupdate
   */
  async updateById(id: number, dataToT: UpdateToTData): Promise<ToT> {
    try {
      let updateData = { ...dataToT };

      // Generate new slug if philosofer is being updated
      if (dataToT.philosofer) {
        updateData.slug = await this.slugGenerator.generateUniqueSlug(
          dataToT.philosofer,
          "tot",
          id
        );
      }

      // Generate new SEO meta if philosofer, geoorigin, or detail_location is being updated
      if (
        dataToT.philosofer ||
        dataToT.geoorigin ||
        dataToT.detail_location ||
        dataToT.years
      ) {
        const currentToT = await prisma.toT.findUnique({ where: { id } });
        if (currentToT) {
          const philosofer = dataToT.philosofer || currentToT.philosofer;
          const geoorigin = dataToT.geoorigin || currentToT.geoorigin;
          const detail_location =
            dataToT.detail_location || currentToT.detail_location;
          const years = dataToT.years || currentToT.years;

          const contentForSEO = `${philosofer} from ${geoorigin}, ${detail_location} (${years})`;
          const seoMeta = this.seoGenerator.generateSEOMeta(
            philosofer,
            contentForSEO
          );

          if (!dataToT.meta_title) {
            updateData.meta_title = seoMeta.metaTitle;
          }
          if (!dataToT.meta_description) {
            updateData.meta_description = seoMeta.metaDescription;
          }
        }
      }

      const updatedToT = await prisma.toT.update({
        where: { id },
        data: updateData,
      });

      return updatedToT;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw new Error("ToT not found");
        }
      }
      throw new Error(
        `Failed to update ToT: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Delete ToT by ID
   * @param id - ID dari ToT yang akan dihapus
   * @returns Promise<ToT> - Record ToT yang telah dihapus
   */
  async deleteById(id: number): Promise<ToT> {
    try {
      const deletedToT = await prisma.toT.delete({
        where: { id },
      });

      return deletedToT;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw new Error("ToT not found");
        }
        if (error.code === "P2003") {
          throw new Error("Cannot delete ToT: it has related records");
        }
      }
      throw new Error(
        `Failed to delete ToT: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }
}
