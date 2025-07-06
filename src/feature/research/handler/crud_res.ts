import { Request, Response } from "express";
import { ResearchService } from "../service/crud_res";

// // Extend Request untuk menambahkan admin dari JWT
// declare global {
//   namespace Express {
//     interface Request {
//       admin?: {
//         admin_Id: number;
//         user?: any;
//         username: string;
//       };
//       file?: Express.Multer.File;
//     }
//   }
// }

export class ResearchHandler {
  private researchService: ResearchService;

  constructor() {
    this.researchService = new ResearchService();
  }

  // Create Research (Admin only)
  createByAdmin = async (req: Request, res: Response): Promise<void> => {
    try {
      // Debug log
      console.log("Request body:", req.body);
      console.log("Request file:", req.file);
      console.log("Request admin:", req.admin);

      const newResearch = await this.researchService.createByAdmin({
        admin_id: req.admin?.admin_Id ?? 0,
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
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: "Invalid ID format",
        });
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

      // Handle research_date if provided
      if (req.body.research_date) {
        updateData.research_date = new Date(req.body.research_date);
      }

      // Handle is_published if provided
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
        res.status(404).json({
          success: false,
          message: "Research not found",
        });
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
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: "Invalid ID format",
        });
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
          res.status(404).json({
            success: false,
            message: "Research not found",
          });
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
      const sortBy = (req.query.sortBy as string) || "id";
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

      if (!researchTitle) {
        res.status(400).json({
          success: false,
          message: "Research title parameter is required",
        });
        return;
      }

      const research = await this.researchService.getByResearchTitle(
        researchTitle
      );

      res.status(200).json({
        success: true,
        message: "Research retrieved successfully",
        data: research,
      });
    } catch (error) {
      if (error instanceof Error && error.message === "Research not found") {
        res.status(404).json({
          success: false,
          message: "Research not found",
        });
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
