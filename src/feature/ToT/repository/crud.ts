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
  admin_id: string; // ← string (cuid)
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

  // Whitelist kolom yang boleh dijadikan sort key agar aman untuk Prisma
  private readonly sortableFields = new Set<keyof ToT | string>([
    "id",
    "philosofer",
    "geoorigin",
    "detail_location",
    "years",
    "slug",
    "is_published",
    "created_at",
    "updated_at",
  ]);

  /**
   * Create a new ToT record
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
   */
  async getAll(
    paginationParams: PaginationParams = {}
  ): Promise<PaginatedResult<ToT>> {
    try {
      const page = Math.max(1, paginationParams.page || 1);
      const limit = Math.min(100, Math.max(1, paginationParams.limit || 10));
      const skip = (page - 1) * limit;

      // Gunakan default sortBy yang aman
      const sortByRaw = paginationParams.sortBy || "created_at";
      const sortBy = this.sortableFields.has(sortByRaw)
        ? (sortByRaw as keyof ToT)
        : ("created_at" as keyof ToT);

      const sortOrder = paginationParams.sortOrder || "desc";

      const [data, total] = await Promise.all([
        prisma.toT.findMany({
          skip,
          take: limit,
          orderBy: {
            [sortBy]: sortOrder,
          } as any, // cast aman karena kita whitelist
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
   */
  async getById(id: string): Promise<ToT | null> {
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
   */
  async updateById(id: string, dataToT: UpdateToTData): Promise<ToT> {
    try {
      let updateData: UpdateToTData = { ...dataToT };

      if (dataToT.philosofer) {
        updateData.slug = await this.slugGenerator.generateUniqueSlug(
          dataToT.philosofer,
          "tot",
          id
        );
      }

      // Generate new SEO meta if any key field is updated
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
   */
  async deleteById(id: string): Promise<ToT> {
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
