import prisma from "../../../config/db";
import { Article, Prisma } from "@prisma/client";
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

export interface CreateArticleData {
  admin_id: number;
  title: string;
  image: string;
  content: string;
  author: string;
  date: Date;
  meta_title?: string;
  meta_description?: string;
  keywords?: string;
  excerpt?: string;
  featured_image_alt?: string;
  canonical_url?: string;
  is_published?: boolean;
  is_featured?: boolean;
}

export interface UpdateArticleData {
  title?: string;
  slug?: string;
  image?: string;
  content?: string;
  author?: string;
  date?: Date;
  meta_title?: string;
  meta_description?: string;
  keywords?: string;
  excerpt?: string;
  featured_image_alt?: string;
  canonical_url?: string;
  is_published?: boolean;
  is_featured?: boolean;
  view_count?: number;
}

export class ArticleRepository {
  private slugGenerator = UtilityFactory.getSlugGenerator();
  private seoGenerator = UtilityFactory.getSEOGenerator();

  /**
   * Create a new Article record (Admin only)
   * @param dataArticle - Data untuk membuat Article baru
   * @returns Promise<Article> - Record Article yang baru dibuat
   */
  async createByAdmin(dataArticle: CreateArticleData): Promise<Article> {
    try {
      // Generate unique slug from title
      const slug = await this.slugGenerator.generateUniqueSlug(
        dataArticle.title,
        "article"
      );

      // Generate SEO meta if not provided
      const seoMeta = this.seoGenerator.generateSEOMeta(
        dataArticle.title,
        dataArticle.content
      );

      const newArticle = await prisma.article.create({
        data: {
          ...dataArticle,
          slug,
          meta_title: dataArticle.meta_title || seoMeta.metaTitle,
          meta_description:
            dataArticle.meta_description || seoMeta.metaDescription,
        },
      });
      return newArticle;
    } catch (error) {
      throw new Error(
        `Failed to create Article: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Update Article by ID (Admin only)
   * @param id - ID dari Article yang akan diupdate
   * @param dataArticle - Data yang akan diupdate
   * @returns Promise<Article> - Record Article yang telah diupdate
   */
  async updateById(
    id: number,
    dataArticle: UpdateArticleData
  ): Promise<Article> {
    try {
      let updateData = { ...dataArticle };

      // Generate new slug if title is being updated
      if (dataArticle.title) {
        updateData.slug = await this.slugGenerator.generateUniqueSlug(
          dataArticle.title,
          "article",
          id
        );
      }

      // Generate new SEO meta if title or content is being updated
      if (dataArticle.title || dataArticle.content) {
        const currentArticle = await prisma.article.findUnique({
          where: { id },
        });
        if (currentArticle) {
          const title = dataArticle.title || currentArticle.title;
          const content = dataArticle.content || currentArticle.content;
          const seoMeta = this.seoGenerator.generateSEOMeta(title, content);

          if (!dataArticle.meta_title) {
            updateData.meta_title = seoMeta.metaTitle;
          }
          if (!dataArticle.meta_description) {
            updateData.meta_description = seoMeta.metaDescription;
          }
        }
      }

      const updatedArticle = await prisma.article.update({
        where: { id },
        data: updateData,
      });

      return updatedArticle;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw new Error("Article not found");
        }
      }
      throw new Error(
        `Failed to update Article: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Delete Article by ID (Admin only)
   * @param id - ID dari Article yang akan dihapus
   * @returns Promise<Article> - Record Article yang telah dihapus
   */
  async deleteById(id: number): Promise<Article> {
    try {
      const deletedArticle = await prisma.article.delete({
        where: { id },
      });

      return deletedArticle;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw new Error("Article not found");
        }
        if (error.code === "P2003") {
          throw new Error("Cannot delete Article: it has related records");
        }
      }
      throw new Error(
        `Failed to delete Article: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Get all Article records with pagination
   * @param paginationParams - Parameters untuk pagination
   * @returns Promise<PaginatedResult<Article>> - Data dengan informasi pagination
   */
  async getAll(
    paginationParams: PaginationParams = {}
  ): Promise<PaginatedResult<Article>> {
    try {
      // Default values untuk pagination
      const page = Math.max(1, paginationParams.page || 1);
      const limit = Math.min(100, Math.max(1, paginationParams.limit || 10)); // Max 100 records per page
      const skip = (page - 1) * limit;
      const sortBy = paginationParams.sortBy || "id";
      const sortOrder = paginationParams.sortOrder || "desc";

      // Execute queries secara parallel untuk performa yang lebih baik
      const [data, total] = await Promise.all([
        prisma.article.findMany({
          skip,
          take: limit,
          orderBy: {
            [sortBy]: sortOrder,
          },
        }),
        prisma.article.count(),
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
        `Failed to get Article list: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Get Article by title
   * @param title - Title dari Article yang ingin diambil
   * @returns Promise<Article | null> - Record Article atau null jika tidak ditemukan
   */
  async getByTitle(title: string): Promise<Article | null> {
    try {
      const article = await prisma.article.findFirst({
        where: { title },
      });
      return article;
    } catch (error) {
      throw new Error(
        `Failed to get Article by title: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }
}
