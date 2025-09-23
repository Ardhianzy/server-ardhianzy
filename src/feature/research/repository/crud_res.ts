import prisma from "../../../config/db";
import { Research, Prisma } from "@prisma/client";
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

export interface CreateResearchData {
  admin_id: string; // ← cuid string
  research_title: string;
  research_sum: string;
  image: string;
  researcher: string;
  research_date: Date;
  meta_title?: string;
  meta_description?: string;
  keywords?: string;
  is_published?: boolean;
  // jika schema kamu punya field lain (mis. "fiel"), tambahkan di sini juga
}

export interface UpdateResearchData {
  research_title?: string;
  slug?: string;
  research_sum?: string;
  image?: string;
  researcher?: string;
  research_date?: Date;
  meta_title?: string;
  meta_description?: string;
  keywords?: string;
  is_published?: boolean;
  // tambahkan field ekstra jika ada di schema
}

export class ResearchRepository {
  private slugGenerator: SlugGenerator = UtilityFactory.getSlugGenerator();
  private seoGenerator: SEOMetaGenerator = UtilityFactory.getSEOGenerator();

  // batasi kolom yang boleh dipakai untuk sorting supaya aman
  private readonly sortableFields = new Set<keyof Research | string>([
    "id",
    "research_title",
    "researcher",
    "research_date",
    "slug",
    "is_published",
    "created_at",
    "updated_at",
  ]);

  /**
   * Create a new Research record (Admin only)
   */
  async createByAdmin(dataResearch: CreateResearchData): Promise<Research> {
    try {
      const slug = await this.slugGenerator.generateUniqueSlug(
        dataResearch.research_title,
        "research"
      );

      const seoMeta = this.seoGenerator.generateSEOMeta(
        dataResearch.research_title,
        dataResearch.research_sum
      );

      const newResearch = await prisma.research.create({
        data: {
          ...dataResearch,
          slug,
          meta_title: dataResearch.meta_title ?? seoMeta.metaTitle,
          meta_description:
            dataResearch.meta_description ?? seoMeta.metaDescription,
        },
      });
      return newResearch;
    } catch (error) {
      throw new Error(
        `Failed to create Research: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Update Research by ID (Admin only)
   */
  async updateById(
    id: string,
    dataResearch: UpdateResearchData
  ): Promise<Research> {
    try {
      let updateData: UpdateResearchData = { ...dataResearch };

      // regenerate slug bila title berubah
      if (dataResearch.research_title) {
        updateData.slug = await this.slugGenerator.generateUniqueSlug(
          dataResearch.research_title,
          "research",
          id // ← exclude current record (string cuid)
        );
      }

      // regenerate SEO meta bila title/summary berubah
      if (dataResearch.research_title || dataResearch.research_sum) {
        const currentResearch = await prisma.research.findUnique({
          where: { id },
        });
        if (currentResearch) {
          const title =
            dataResearch.research_title ?? currentResearch.research_title;
          const summary =
            dataResearch.research_sum ?? currentResearch.research_sum;
          const seoMeta = this.seoGenerator.generateSEOMeta(title, summary);

          if (!dataResearch.meta_title) {
            updateData.meta_title = seoMeta.metaTitle;
          }
          if (!dataResearch.meta_description) {
            updateData.meta_description = seoMeta.metaDescription;
          }
        }
      }

      const updatedResearch = await prisma.research.update({
        where: { id },
        data: updateData,
      });

      return updatedResearch;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        throw new Error("Research not found");
      }
      throw new Error(
        `Failed to update Research: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Delete Research by ID (Admin only)
   */
  async deleteById(id: string): Promise<Research> {
    try {
      const deletedResearch = await prisma.research.delete({
        where: { id },
      });
      return deletedResearch;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw new Error("Research not found");
        }
        if (error.code === "P2003") {
          throw new Error("Cannot delete Research: it has related records");
        }
      }
      throw new Error(
        `Failed to delete Research: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Get all Research records with pagination
   */
  async getAll(
    paginationParams: PaginationParams = {}
  ): Promise<PaginatedResult<Research>> {
    try {
      const page = Math.max(1, paginationParams.page ?? 1);
      const limit = Math.min(100, Math.max(1, paginationParams.limit ?? 10));
      const skip = (page - 1) * limit;

      const sortByRaw = paginationParams.sortBy ?? "created_at";
      const sortBy = this.sortableFields.has(sortByRaw)
        ? (sortByRaw as keyof Research)
        : ("created_at" as keyof Research);

      const sortOrder = paginationParams.sortOrder ?? "desc";

      const [data, total] = await Promise.all([
        prisma.research.findMany({
          skip,
          take: limit,
          orderBy: {
            [sortBy]: sortOrder,
          } as any,
        }),
        prisma.research.count(),
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
        `Failed to get Research list: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Get Research by research title
   */
  async getByResearchTitle(researchTitle: string): Promise<Research | null> {
    try {
      const research = await prisma.research.findFirst({
        where: { research_title: researchTitle },
      });
      return research;
    } catch (error) {
      throw new Error(
        `Failed to get Research by research title: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }
}
