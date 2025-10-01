import { ArticleRepository } from "../repository/crud_articel";
import { Article } from "@prisma/client";
import imagekit from "../../../libs/imageKit";
import path from "path";

// Interface untuk Create Article (disesuaikan schema)
interface CreateArticleData {
  image?: Express.Multer.File;
  title: string;
  content: string;
  author: string;
  date: Date | string;
  meta_title?: string | null;
  meta_description?: string | null;
  keywords?: string | null;
  excerpt?: string | null;
  canonical_url?: string | null;
  is_published?: boolean;
  is_featured?: boolean;
  admin_id: string; // <- string (cuid)
}

// Interface untuk Update Article (disesuaikan schema)
interface UpdateArticleData {
  image?: Express.Multer.File;
  title?: string;
  content?: string;
  author?: string;
  date?: Date | string;
  meta_title?: string | null;
  meta_description?: string | null;
  keywords?: string | null;
  excerpt?: string | null;
  canonical_url?: string | null;
  is_published?: boolean;
  is_featured?: boolean;
  view_count?: number;
}

// Pagination
interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: keyof Article; // batasi hanya kolom valid
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

export class ArticleService {
  private repo: ArticleRepository;

  constructor() {
    this.repo = new ArticleRepository();
  }

  // Create Article (Admin only)
  async createByAdmin(articleData: CreateArticleData): Promise<Article> {
    // Validasi input minimal
    if (!articleData.title?.trim()) throw new Error("Title is required");
    if (!articleData.content?.trim()) throw new Error("Content is required");
    if (!articleData.author?.trim()) throw new Error("Author is required");
    if (!articleData.date) throw new Error("Date is required");
    if (!articleData.admin_id?.trim()) throw new Error("Admin ID is required");

    // Normalisasi date
    const theDate =
      articleData.date instanceof Date
        ? articleData.date
        : new Date(articleData.date);

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
      } catch {
        throw new Error("Failed to upload image");
      }
    }

    // Wajib image? Kalau ya, enforce di sini:
    if (!imageUrl) {
      throw new Error("Image is required");
    }

    return this.repo.createByAdmin({
      admin_id: articleData.admin_id,
      title: articleData.title,
      image: imageUrl,
      content: articleData.content,
      author: articleData.author,
      date: theDate,
      meta_title: articleData.meta_title ?? null,
      meta_description: articleData.meta_description ?? null,
      keywords: articleData.keywords ?? null,
      excerpt: articleData.excerpt ?? null,
      canonical_url: articleData.canonical_url ?? null,
      is_published: articleData.is_published ?? false,
      is_featured: articleData.is_featured ?? false,
    });
  }

  // Update Article by ID (Admin only)
  async updateById(
    id: string,
    articleData: UpdateArticleData
  ): Promise<Article> {
    const updateData: any = {};

    // Field teks
    if (articleData.title?.trim()) updateData.title = articleData.title;
    if (articleData.content?.trim()) updateData.content = articleData.content;
    if (articleData.author?.trim()) updateData.author = articleData.author;

    // Tanggal
    if (articleData.date) {
      updateData.date =
        articleData.date instanceof Date
          ? articleData.date
          : new Date(articleData.date);
    }

    // Meta & optional
    if (articleData.meta_title !== undefined)
      updateData.meta_title = articleData.meta_title;
    if (articleData.meta_description !== undefined)
      updateData.meta_description = articleData.meta_description;
    if (articleData.keywords !== undefined)
      updateData.keywords = articleData.keywords;
    if (articleData.excerpt !== undefined)
      updateData.excerpt = articleData.excerpt;
    if (articleData.canonical_url !== undefined)
      updateData.canonical_url = articleData.canonical_url;

    if (articleData.is_published !== undefined)
      updateData.is_published = articleData.is_published;
    if (articleData.is_featured !== undefined)
      updateData.is_featured = articleData.is_featured;
    if (articleData.view_count !== undefined)
      updateData.view_count = articleData.view_count;

    // Upload image baru jika ada
    if (articleData.image) {
      try {
        const fileBase64 = articleData.image.buffer.toString("base64");
        const response = await imagekit.upload({
          fileName: Date.now() + path.extname(articleData.image.originalname),
          file: fileBase64,
          folder: "Ardianzy/article",
        });
        updateData.image = response.url;
      } catch {
        throw new Error("Failed to upload image");
      }
    }

    // Langsung delegasi ke repo; biarkan repo melempar "Article not found" jika tidak ada
    return this.repo.updateById(id, updateData);
  }

  // Delete Article by ID (Admin only)
  async deleteById(id: string): Promise<Article> {
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
