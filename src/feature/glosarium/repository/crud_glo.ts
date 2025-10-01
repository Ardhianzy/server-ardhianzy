import prisma from "../../../config/db";
import { Glosarium, Prisma } from "@prisma/client";
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

export interface CreateGlosariumData {
  admin_id: string; // <-- PERUBAHAN: dari number ke string (sesuai CUID)
  term: string;
  definition: string;
  meta_title?: string;
  meta_description?: string;
  keywords?: string;
  etymology?: string;
  examples?: string;
  related_terms?: string;
  is_published?: boolean;
}

export interface UpdateGlosariumData {
  term?: string;
  definition?: string;
  slug?: string;
  meta_title?: string;
  meta_description?: string;
  keywords?: string;
  etymology?: string;
  examples?: string;
  related_terms?: string;
  is_published?: boolean;
}

export class GlosariumRepository {
  private slugGenerator = UtilityFactory.getSlugGenerator();
  private seoGenerator = UtilityFactory.getSEOGenerator();

  // Menambahkan whitelist untuk kolom yang bisa di-sort
  private readonly sortableFields = new Set<keyof Glosarium | string>([
    "id",
    "term",
    "created_at",
    "updated_at",
  ]);

  /**
   * Create a new Glosarium record (Admin only)
   * @param dataGlosarium - Data untuk membuat Glosarium baru
   * @returns Promise<Glosarium> - Record Glosarium yang baru dibuat
   */
  async create(dataGlosarium: CreateGlosariumData): Promise<Glosarium> {
    try {
      // Generate unique slug from term
      const slug = await this.slugGenerator.generateUniqueSlug(
        dataGlosarium.term,
        "glosarium"
      );

      // Generate SEO meta if not provided
      const seoMeta = this.seoGenerator.generateSEOMeta(
        dataGlosarium.term,
        dataGlosarium.definition
      );

      const newGlosarium = await prisma.glosarium.create({
        data: {
          ...dataGlosarium,
          slug,
          meta_title: dataGlosarium.meta_title ?? seoMeta.metaTitle,
          meta_description:
            dataGlosarium.meta_description ?? seoMeta.metaDescription,
        },
      });
      return newGlosarium;
    } catch (error) {
      throw new Error(
        `Failed to create Glosarium: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Get all Glosarium records with pagination
   * @param paginationParams - Parameters untuk pagination
   * @returns Promise<PaginatedResult<Glosarium>> - Data dengan informasi pagination
   */
  async getAll(
    paginationParams: PaginationParams = {}
  ): Promise<PaginatedResult<Glosarium>> {
    try {
      const page = Math.max(1, paginationParams.page || 1);
      const limit = Math.min(100, Math.max(1, paginationParams.limit || 10));
      const skip = (page - 1) * limit;

      const sortByRaw = paginationParams.sortBy || "created_at";
      const sortBy = this.sortableFields.has(sortByRaw)
        ? sortByRaw
        : "created_at";

      const sortOrder = paginationParams.sortOrder || "desc";

      const [data, total] = await Promise.all([
        prisma.glosarium.findMany({
          skip,
          take: limit,
          orderBy: {
            [sortBy]: sortOrder,
          },
        }),
        prisma.glosarium.count(),
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
        `Failed to get Glosarium list: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Get Glosarium by definition
   * @param definition - Definition dari Glosarium yang ingin diambil
   * @returns Promise<Glosarium | null> - Record Glosarium atau null jika tidak ditemukan
   */
  async getByDefinition(definition: string): Promise<Glosarium | null> {
    try {
      const glosarium = await prisma.glosarium.findFirst({
        where: { definition },
      });
      return glosarium;
    } catch (error) {
      throw new Error(
        `Failed to get Glosarium by definition: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Update Glosarium by ID (Admin only)
   * @param id - ID dari Glosarium yang akan diupdate
   * @param dataGlosarium - Data yang akan diupdate
   * @returns Promise<Glosarium> - Record Glosarium yang telah diupdate
   */
  async updateById(
    id: string, // <-- PERUBAHAN: dari number ke string
    dataGlosarium: UpdateGlosariumData
  ): Promise<Glosarium> {
    try {
      let updateData: UpdateGlosariumData = { ...dataGlosarium };

      if (dataGlosarium.term) {
        updateData.slug = await this.slugGenerator.generateUniqueSlug(
          dataGlosarium.term,
          "glosarium",
          id // excludeId sekarang adalah string
        );
      }

      if (dataGlosarium.term || dataGlosarium.definition) {
        const currentGlosarium = await prisma.glosarium.findUnique({
          where: { id },
        });
        if (currentGlosarium) {
          const term = dataGlosarium.term || currentGlosarium.term;
          const definition =
            dataGlosarium.definition || currentGlosarium.definition;
          const seoMeta = this.seoGenerator.generateSEOMeta(term, definition);

          if (!dataGlosarium.meta_title) {
            updateData.meta_title = seoMeta.metaTitle;
          }
          if (!dataGlosarium.meta_description) {
            updateData.meta_description = seoMeta.metaDescription;
          }
        }
      }

      const updatedGlosarium = await prisma.glosarium.update({
        where: { id },
        data: updateData,
      });

      return updatedGlosarium;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw new Error("Glosarium not found");
        }
      }
      throw new Error(
        `Failed to update Glosarium: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Delete Glosarium by ID (Admin only)
   * @param id - ID dari Glosarium yang akan dihapus
   * @returns Promise<Glosarium> - Record Glosarium yang telah dihapus
   */
  async deleteById(id: string): Promise<Glosarium> {
    // <-- PERUBAHAN: dari number ke string
    try {
      const deletedGlosarium = await prisma.glosarium.delete({
        where: { id },
      });

      return deletedGlosarium;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw new Error("Glosarium not found");
        }
        if (error.code === "P2003") {
          throw new Error("Cannot delete Glosarium: it has related records");
        }
      }
      throw new Error(
        `Failed to delete Glosarium: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }
}
