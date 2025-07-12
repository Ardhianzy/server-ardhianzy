import { Request, Response } from "express";
import { ArticleService } from "../service/crud_articel";
import "../../../types/express";
export class ArticleHandler {
  private articleService: ArticleService;

  constructor() {
    this.articleService = new ArticleService();
  }

  // Create Article (Admin only)
  createByAdmin = async (req: Request, res: Response): Promise<void> => {
    try {
      // Debug log
      console.log("Request body:", req.body);
      console.log("Request file:", req.file);
      console.log("Request admin:", req.admin);

      const newArticle = await this.articleService.createByAdmin({
        admin_id: req.admin?.admin_Id ?? 0,
        title: req.body.title,
        content: req.body.content,
        author: req.body.author,
        date: new Date(req.body.date),
        meta_title: req.body.meta_title,
        meta_description: req.body.meta_description,
        keywords: req.body.keywords,
        excerpt: req.body.excerpt,
        featured_image_alt: req.body.featured_image_alt,
        canonical_url: req.body.canonical_url,
        is_published:
          req.body.is_published === "true" || req.body.is_published === true,
        is_featured:
          req.body.is_featured === "true" || req.body.is_featured === true,
        image: req.file,
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
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: "Invalid ID format",
        });
        return;
      }

      const updateData: any = {
        title: req.body.title,
        content: req.body.content,
        author: req.body.author,
        meta_title: req.body.meta_title,
        meta_description: req.body.meta_description,
        keywords: req.body.keywords,
        excerpt: req.body.excerpt,
        featured_image_alt: req.body.featured_image_alt,
        canonical_url: req.body.canonical_url,
        image: req.file,
      };

      // Handle date if provided
      if (req.body.date) {
        updateData.date = new Date(req.body.date);
      }

      // Handle boolean fields if provided
      if (req.body.is_published !== undefined) {
        updateData.is_published =
          req.body.is_published === "true" || req.body.is_published === true;
      }
      if (req.body.is_featured !== undefined) {
        updateData.is_featured =
          req.body.is_featured === "true" || req.body.is_featured === true;
      }
      if (req.body.view_count !== undefined) {
        updateData.view_count = parseInt(req.body.view_count);
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
        res.status(404).json({
          success: false,
          message: "Article not found",
        });
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
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: "Invalid ID format",
        });
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
          res.status(404).json({
            success: false,
            message: "Article not found",
          });
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
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const sortBy = (req.query.sortBy as string) || "id";
      const sortOrder = (req.query.sortOrder as "asc" | "desc") || "desc";

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
