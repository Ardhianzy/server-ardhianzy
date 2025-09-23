import { Request, Response } from "express";
import { ResearchService } from "../service/crud_res";

// Extend Request untuk payload JWT (string cuid) + file upload
declare global {
  namespace Express {
    interface Request {
      user?: {
        admin_Id: string;
        username: string;
      };
      file?: Express.Multer.File;
    }
  }
}

export class ResearchHandler {
  private researchService: ResearchService;

  constructor() {
    this.researchService = new ResearchService();
  }

  // Create Research (Admin only)
  createByAdmin = async (req: Request, res: Response): Promise<void> => {
    try {
      const adminId = req.user?.admin_Id;
      if (!adminId?.trim()) {
        res
          .status(401)
          .json({ success: false, message: "Authentication required" });
        return;
      }

      const newResearch = await this.researchService.createByAdmin({
        admin_id: adminId, // cuid string
        research_title: req.body.research_title,
        research_sum: req.body.research_sum,
        researcher: req.body.researcher,
        research_date: new Date(req.body.research_date),
        meta_title: req.body.meta_title,
        meta_description: req.body.meta_description,
        keywords: req.body.keywords,
        is_published:
          req.body.is_published === "true" || req.body.is_published === true,
        image: req.file,
      });

      res.status(201).json({
        success: true,
        message: "Research created successfully",
        data: newResearch,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to create Research",
      });
    }
  };

  // Update Research by ID (Admin only)
  updateById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id; // cuid string

      if (!id?.trim()) {
        res.status(400).json({ success: false, message: "Invalid ID format" });
        return;
      }

      const updateData: any = {
        research_title: req.body.research_title,
        research_sum: req.body.research_sum,
        researcher: req.body.researcher,
        meta_title: req.body.meta_title,
        meta_description: req.body.meta_description,
        keywords: req.body.keywords,
        image: req.file,
      };

      if (req.body.research_date) {
        updateData.research_date = new Date(req.body.research_date);
      }

      if (req.body.is_published !== undefined) {
        updateData.is_published =
          req.body.is_published === "true" || req.body.is_published === true;
      }

      const updatedResearch = await this.researchService.updateById(
        id,
        updateData
      );

      res.status(200).json({
        success: true,
        message: "Research updated successfully",
        data: updatedResearch,
      });
    } catch (error) {
      if (error instanceof Error && error.message === "Research not found") {
        res.status(404).json({ success: false, message: "Research not found" });
        return;
      }
      res.status(500).json({
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to update Research",
      });
    }
  };

  // Delete Research by ID (Admin only)
  deleteById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id; // cuid string

      if (!id?.trim()) {
        res.status(400).json({ success: false, message: "Invalid ID format" });
        return;
      }

      const deletedResearch = await this.researchService.deleteById(id);

      res.status(200).json({
        success: true,
        message: "Research deleted successfully",
        data: deletedResearch,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Research not found") {
          res
            .status(404)
            .json({ success: false, message: "Research not found" });
          return;
        }
        if (
          error.message === "Cannot delete Research: it has related records"
        ) {
          res.status(400).json({
            success: false,
            message: "Cannot delete Research: it has related records",
          });
          return;
        }
      }
      res.status(500).json({
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to delete Research",
      });
    }
  };

  // Get all Research dengan pagination
  getAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const sortBy = (req.query.sortBy as string) || undefined; // biar service yang pilih default
      const sortOrder = (req.query.sortOrder as "asc" | "desc") || "desc";

      const result = await this.researchService.getAll({
        page,
        limit,
        sortBy,
        sortOrder,
      });

      res.status(200).json({
        success: true,
        message: "Research retrieved successfully",
        ...result,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch Research list",
      });
    }
  };

  // Get Research by research title
  getByResearchTitle = async (req: Request, res: Response): Promise<void> => {
    try {
      const { researchTitle } = req.params;

      if (!researchTitle?.trim()) {
        res.status(400).json({
          success: false,
          message: "Research title parameter is required",
        });
        return;
      }

      const research = await this.researchService.getByResearchTitle(
        researchTitle.trim()
      );

      res.status(200).json({
        success: true,
        message: "Research retrieved successfully",
        data: research,
      });
    } catch (error) {
      if (error instanceof Error && error.message === "Research not found") {
        res.status(404).json({ success: false, message: "Research not found" });
        return;
      }
      res.status(500).json({
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to fetch Research",
      });
    }
  };
}
