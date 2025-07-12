import { Request, Response } from "express";
import { TotService } from "../service/crud";
import "../../../types/express";
export class TotHandler {
  private totService: TotService;

  constructor() {
    this.totService = new TotService();
  }

  // Create ToT
  createToT = async (req: Request, res: Response): Promise<void> => {
    try {
      // Debug log
      console.log("Request body:", req.body);
      console.log("Request file:", req.file);
      console.log("Request admin:", req.admin);

      const newToT = await this.totService.create({
        admin_id: req.admin?.admin_Id ?? 0,
        philosofer: req.body.philosofer,
        geoorigin: req.body.geoorigin,
        detail_location: req.body.detail_location,
        years: req.body.years,
        meta_title: req.body.meta_title,
        meta_description: req.body.meta_description,
        keywords: req.body.keywords,
        is_published:
          req.body.is_published === "true" || req.body.is_published === true,
        image: req.file,
      });

      res.status(201).json({
        success: true,
        message: "ToT created successfully",
        data: newToT,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to create ToT",
      });
    }
  };

  // Get all ToT dengan pagination
  getAllToT = async (req: Request, res: Response): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const sortBy = (req.query.sortBy as string) || "id";
      const sortOrder = (req.query.sortOrder as "asc" | "desc") || "desc";

      const result = await this.totService.getAll({
        page,
        limit,
        sortBy,
        sortOrder,
      });

      res.status(200).json({
        success: true,
        message: "ToT retrieved successfully",
        ...result,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to fetch ToT list",
      });
    }
  };

  // Get ToT by ID
  getTotById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: "Invalid ID format",
        });
        return;
      }

      const tot = await this.totService.getById(id);

      res.status(200).json({
        success: true,
        message: "ToT retrieved successfully",
        data: tot,
      });
    } catch (error) {
      if (error instanceof Error && error.message === "ToT not found") {
        res.status(404).json({
          success: false,
          message: "ToT not found",
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch ToT",
      });
    }
  };

  // Get ToT by Philosofer
  getTotByPhilosofer = async (req: Request, res: Response): Promise<void> => {
    try {
      const { philosofer } = req.params;

      if (!philosofer) {
        res.status(400).json({
          success: false,
          message: "Philosofer parameter is required",
        });
        return;
      }

      const tot = await this.totService.getByPhilosofer(philosofer);

      res.status(200).json({
        success: true,
        message: "ToT retrieved successfully",
        data: tot,
      });
    } catch (error) {
      if (error instanceof Error && error.message === "ToT not found") {
        res.status(404).json({
          success: false,
          message: "ToT not found",
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch ToT",
      });
    }
  };

  // Update ToT by ID
  updateToT = async (req: Request, res: Response): Promise<void> => {
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
        philosofer: req.body.philosofer,
        geoorigin: req.body.geoorigin,
        detail_location: req.body.detail_location,
        years: req.body.years,
        meta_title: req.body.meta_title,
        meta_description: req.body.meta_description,
        keywords: req.body.keywords,
        image: req.file,
      };

      // Handle boolean field if provided
      if (req.body.is_published !== undefined) {
        updateData.is_published =
          req.body.is_published === "true" || req.body.is_published === true;
      }

      const updatedToT = await this.totService.updateById(id, updateData);

      res.status(200).json({
        success: true,
        message: "ToT updated successfully",
        data: updatedToT,
      });
    } catch (error) {
      if (error instanceof Error && error.message === "ToT not found") {
        res.status(404).json({
          success: false,
          message: "ToT not found",
        });
        return;
      }

      res.status(500).json({
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to update ToT",
      });
    }
  };

  // Delete ToT by ID
  deleteToT = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: "Invalid ID format",
        });
        return;
      }

      const deletedToT = await this.totService.deleteById(id);

      res.status(200).json({
        success: true,
        message: "ToT deleted successfully",
        data: deletedToT,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "ToT not found") {
          res.status(404).json({
            success: false,
            message: "ToT not found",
          });
          return;
        }
        if (error.message === "Cannot delete ToT: it has related records") {
          res.status(400).json({
            success: false,
            message: "Cannot delete ToT: it has related records",
          });
          return;
        }
      }

      res.status(500).json({
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to delete ToT",
      });
    }
  };
}
