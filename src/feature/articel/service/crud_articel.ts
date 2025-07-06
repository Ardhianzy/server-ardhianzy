import { ArticleRepository } from "../repository/crud_articel";
import { Article } from "@prisma/client";
import imagekit from "../../../libs/imageKit";
import path from "path";

// Interface untuk Create Article
interface CreateArticleData {
  image?: Express.Multer.File;
  title: string;
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
  admin_id: number;
}

// Interface untuk Update Article
interface UpdateArticleData {
  image?: Express.Multer.File;
  title?: string;
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

// Interface untuk Pagination
interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// Interface untuk Pagination Result
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

export class ArticleService {
  private repo: ArticleRepository;

  constructor() {
    this.repo = new ArticleRepository();
  }

  // Create Article (Admin only)
  async createByAdmin(articleData: CreateArticleData): Promise<Article> {
    // Validasi input
    if (!articleData.title?.trim()) {
      throw new Error("Title is required");
    }
    if (!articleData.content?.trim()) {
      throw new Error("Content is required");
    }
    if (!articleData.author?.trim()) {
      throw new Error("Author is required");
    }
    if (!articleData.date) {
      throw new Error("Date is required");
    }
    if (!articleData.admin_id) {
      throw new Error("Admin ID is required");
    }

    let imageUrl: string | undefined;

    // Upload image jika ada
    if (articleData.image) {
      try {
        const fileBase64 = articleData.image.buffer.toString("base64");
        const response = await imagekit.upload({
          fileName: Date.now() + path.extname(articleData.image.originalname),
          file: fileBase64,
          folder: "Ardianzy/article",
        });
        imageUrl = response.url;
      } catch (error) {
        throw new Error("Failed to upload image");
      }
    }

    if (!imageUrl) {
      throw new Error("Image is required");
    }

    return this.repo.createByAdmin({
      admin_id: articleData.admin_id,
      title: articleData.title,
      image: imageUrl,
      content: articleData.content,
      author: articleData.author,
      date: articleData.date,
      meta_title: articleData.meta_title,
      meta_description: articleData.meta_description,
      keywords: articleData.keywords,
      excerpt: articleData.excerpt,
      featured_image_alt: articleData.featured_image_alt,
      canonical_url: articleData.canonical_url,
      is_published: articleData.is_published,
      is_featured: articleData.is_featured,
    });
  }

  // Update Article by ID (Admin only)
  async updateById(
    id: number,
    articleData: UpdateArticleData
  ): Promise<Article> {
    // Check if Article exists
    const existingArticle = await this.repo.getByTitle("");
    if (!existingArticle) {
      // Verify existence by checking get all and finding by id
      const allArticles = await this.repo.getAll({ page: 1, limit: 1 });
      const found = allArticles.data.find((a) => a.id === id);
      if (!found) {
        throw new Error("Article not found");
      }
    }

    const updateData: any = {};

    // Only update provided fields
    if (articleData.title?.trim()) {
      updateData.title = articleData.title;
    }
    if (articleData.content?.trim()) {
      updateData.content = articleData.content;
    }
    if (articleData.author?.trim()) {
      updateData.author = articleData.author;
    }
    if (articleData.date) {
      updateData.date = articleData.date;
    }
    if (articleData.meta_title?.trim()) {
      updateData.meta_title = articleData.meta_title;
    }
    if (articleData.meta_description?.trim()) {
      updateData.meta_description = articleData.meta_description;
    }
    if (articleData.keywords?.trim()) {
      updateData.keywords = articleData.keywords;
    }
    if (articleData.excerpt?.trim()) {
      updateData.excerpt = articleData.excerpt;
    }
    if (articleData.featured_image_alt?.trim()) {
      updateData.featured_image_alt = articleData.featured_image_alt;
    }
    if (articleData.canonical_url?.trim()) {
      updateData.canonical_url = articleData.canonical_url;
    }
    if (articleData.is_published !== undefined) {
      updateData.is_published = articleData.is_published;
    }
    if (articleData.is_featured !== undefined) {
      updateData.is_featured = articleData.is_featured;
    }
    if (articleData.view_count !== undefined) {
      updateData.view_count = articleData.view_count;
    }

    // Upload new image if provided
    if (articleData.image) {
      try {
        const fileBase64 = articleData.image.buffer.toString("base64");
        const response = await imagekit.upload({
          fileName: Date.now() + path.extname(articleData.image.originalname),
          file: fileBase64,
          folder: "Ardianzy/article",
        });
        updateData.image = response.url;
      } catch (error) {
        throw new Error("Failed to upload image");
      }
    }

    return this.repo.updateById(id, updateData);
  }

  // Delete Article by ID (Admin only)
  async deleteById(id: number): Promise<Article> {
    // Check if Article exists by trying to get one with similar approach
    try {
      return await this.repo.deleteById(id);
    } catch (error) {
      if (error instanceof Error && error.message === "Article not found") {
        throw new Error("Article not found");
      }
      throw error;
    }
  }

  // Get all Article dengan pagination
  async getAll(
    paginationParams?: PaginationParams
  ): Promise<PaginatedResult<Article>> {
    return this.repo.getAll(paginationParams || {});
  }

  // Get Article by title
  async getByTitle(title: string): Promise<Article> {
    const article = await this.repo.getByTitle(title);
    if (!article) {
      throw new Error("Article not found");
    }
    return article;
  }
}
