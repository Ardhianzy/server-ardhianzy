import { Request, Response } from "express";
import { ArticleService } from "../service/crud_articel";
import { Article } from "@prisma/client";

// Extend Request agar cocok dengan middleware kamu (req.user)
declare global {
  namespace Express {
    interface Request {
      user?: {
        admin_Id: string; // dari JWT
        username: string;
      };
      file?: Express.Multer.File;
    }
  }
}

export class ArticleHandler {
  private articleService: ArticleService;

  constructor() {
    this.articleService = new ArticleService();
  }

  // Create Article (Admin only)
  createByAdmin = async (req: Request, res: Response): Promise<void> => {
    try {
      const adminId = req.user?.admin_Id; // <<< ambil dari middleware
      if (!adminId) {
        res
          .status(401)
          .json({ success: false, message: "Unauthorized: admin not found" });
        return;
      }

      // Normalisasi boolean dari form-data
      const isPublished =
        req.body.is_published === "true" || req.body.is_published === true;
      const isFeatured =
        req.body.is_featured === "true" || req.body.is_featured === true;

      // Validasi & normalisasi date
      if (!req.body.date) {
        res.status(400).json({ success: false, message: "Date is required" });
        return;
      }
      const date = new Date(req.body.date);
      if (isNaN(date.getTime())) {
        res
          .status(400)
          .json({ success: false, message: "Invalid date format" });
        return;
      }

      const newArticle = await this.articleService.createByAdmin({
        admin_id: String(adminId),
        title: req.body.title,
        content: req.body.content,
        author: req.body.author,
        date,
        meta_title: req.body.meta_title ?? null,
        meta_description: req.body.meta_description ?? null,
        keywords: req.body.keywords ?? null,
        excerpt: req.body.excerpt ?? null,
        canonical_url: req.body.canonical_url ?? null,
        is_published: isPublished,
        is_featured: isFeatured,
        image: req.file, // service akan upload ke ImageKit jika ada
      });

      res.status(201).json({
        success: true,
        message: "Article created successfully",
        data: newArticle,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to create Article",
      });
    }
  };

  // Update Article by ID (Admin only)
  updateById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id; // id string (cuid)
      if (!id || typeof id !== "string") {
        res.status(400).json({ success: false, message: "Invalid ID format" });
        return;
      }

      const updateData: any = {
        title: req.body.title ?? undefined,
        content: req.body.content ?? undefined,
        author: req.body.author ?? undefined,
        meta_title: req.body.meta_title ?? undefined,
        meta_description: req.body.meta_description ?? undefined,
        keywords: req.body.keywords ?? undefined,
        excerpt: req.body.excerpt ?? undefined,
        canonical_url: req.body.canonical_url ?? undefined,
        image: req.file, // jika ada file, service akan upload
      };

      if (req.body.date !== undefined) {
        const d = new Date(req.body.date);
        if (isNaN(d.getTime())) {
          res
            .status(400)
            .json({ success: false, message: "Invalid date format" });
          return;
        }
        updateData.date = d;
      }

      if (req.body.is_published !== undefined) {
        updateData.is_published =
          req.body.is_published === "true" || req.body.is_published === true;
      }
      if (req.body.is_featured !== undefined) {
        updateData.is_featured =
          req.body.is_featured === "true" || req.body.is_featured === true;
      }
      if (req.body.view_count !== undefined) {
        const vc = parseInt(req.body.view_count, 10);
        if (Number.isNaN(vc)) {
          res
            .status(400)
            .json({ success: false, message: "view_count must be a number" });
          return;
        }
        updateData.view_count = vc;
      }

      const updatedArticle = await this.articleService.updateById(
        id,
        updateData
      );

      res.status(200).json({
        success: true,
        message: "Article updated successfully",
        data: updatedArticle,
      });
    } catch (error) {
      if (error instanceof Error && error.message === "Article not found") {
        res.status(404).json({ success: false, message: "Article not found" });
        return;
      }
      res.status(500).json({
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to update Article",
      });
    }
  };

  // Delete Article by ID (Admin only)
  deleteById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id; // string cuid
      if (!id || typeof id !== "string") {
        res.status(400).json({ success: false, message: "Invalid ID format" });
        return;
      }

      const deletedArticle = await this.articleService.deleteById(id);

      res.status(200).json({
        success: true,
        message: "Article deleted successfully",
        data: deletedArticle,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Article not found") {
          res
            .status(404)
            .json({ success: false, message: "Article not found" });
          return;
        }
        if (error.message === "Cannot delete Article: it has related records") {
          res.status(400).json({
            success: false,
            message: "Cannot delete Article: it has related records",
          });
          return;
        }
      }
      res.status(500).json({
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to delete Article",
      });
    }
  };

  // Get all Article dengan pagination
  getAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 10;

      const validSortBy: (keyof Article)[] = [
        "id",
        "title",
        "slug",
        "author",
        "date",
        "created_at",
        "updated_at",
        "is_published",
        "is_featured",
        "view_count",
      ];
      const rawSortBy = (req.query.sortBy as string) || "created_at";
      const sortBy = (
        validSortBy.includes(rawSortBy as keyof Article)
          ? (rawSortBy as keyof Article)
          : "created_at"
      ) as keyof Article;

      const sortOrder =
        (req.query.sortOrder as "asc" | "desc") === "asc" ? "asc" : "desc";

      const result = await this.articleService.getAll({
        page,
        limit,
        sortBy,
        sortOrder,
      });

      res.status(200).json({
        success: true,
        message: "Article retrieved successfully",
        ...result,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch Article list",
      });
    }
  };

  // Get Article by title
  getByTitle = async (req: Request, res: Response): Promise<void> => {
    try {
      const { title } = req.params;
      if (!title) {
        res.status(400).json({
          success: false,
          message: "Title parameter is required",
        });
        return;
      }

      const article = await this.articleService.getByTitle(title);

      res.status(200).json({
        success: true,
        message: "Article retrieved successfully",
        data: article,
      });
    } catch (error) {
      if (error instanceof Error && error.message === "Article not found") {
        res.status(404).json({
          success: false,
          message: "Article not found",
        });
        return;
      }
      res.status(500).json({
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to fetch Article",
      });
    }
  };
}
