import { Request, Response } from "express";
import { ToTMetaService } from "../service/crud";
import "../../../types/express";
export class ToTMetaHandler {
  private totMetaService: ToTMetaService;

  constructor() {
    this.totMetaService = new ToTMetaService();
  }

  // Create ToT Meta (Admin only)
  createByAdmin = async (req: Request, res: Response): Promise<void> => {
    try {
      // Debug log
      console.log("Request body:", req.body);
      console.log("Request admin:", req.admin);

      const newToTMeta = await this.totMetaService.createByAdmin({
        ToT_id: parseInt(req.body.ToT_id),
        metafisika: req.body.metafisika,
        epsimologi: req.body.epsimologi,
        aksiologi: req.body.aksiologi,
        conclusion: req.body.conclusion,
      });

      res.status(201).json({
        success: true,
        message: "ToT Meta created successfully",
        data: newToTMeta,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to create ToT Meta",
      });
    }
  };

  // Update ToT Meta by ID (Admin only)
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
        metafisika: req.body.metafisika,
        epsimologi: req.body.epsimologi,
        aksiologi: req.body.aksiologi,
        conclusion: req.body.conclusion,
      };

      // Handle ToT_id if provided
      if (req.body.ToT_id) {
        updateData.ToT_id = parseInt(req.body.ToT_id);
      }

      const updatedToTMeta = await this.totMetaService.updateById(
        id,
        updateData
      );

      res.status(200).json({
        success: true,
        message: "ToT Meta updated successfully",
        data: updatedToTMeta,
      });
    } catch (error) {
      if (error instanceof Error && error.message === "ToT Meta not found") {
        res.status(404).json({
          success: false,
          message: "ToT Meta not found",
        });
        return;
      }

      res.status(500).json({
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to update ToT Meta",
      });
    }
  };

  // Delete ToT Meta by ID (Admin only)
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

      const deletedToTMeta = await this.totMetaService.deleteById(id);

      res.status(200).json({
        success: true,
        message: "ToT Meta deleted successfully",
        data: deletedToTMeta,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "ToT Meta not found") {
          res.status(404).json({
            success: false,
            message: "ToT Meta not found",
          });
          return;
        }
        if (
          error.message === "Cannot delete ToT Meta: it has related records"
        ) {
          res.status(400).json({
            success: false,
            message: "Cannot delete ToT Meta: it has related records",
          });
          return;
        }
      }

      res.status(500).json({
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to delete ToT Meta",
      });
    }
  };

  // Get all ToT Meta dengan pagination
  getAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const sortBy = (req.query.sortBy as string) || "id";
      const sortOrder = (req.query.sortOrder as "asc" | "desc") || "desc";

      const result = await this.totMetaService.getAll({
        page,
        limit,
        sortBy,
        sortOrder,
      });

      res.status(200).json({
        success: true,
        message: "ToT Meta retrieved successfully",
        ...result,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch ToT Meta list",
      });
    }
  };

  // Get ToT Meta by ToT ID
  getByToTId = async (req: Request, res: Response): Promise<void> => {
    try {
      const { totId } = req.params;
      const totIdNumber = parseInt(totId);

      if (isNaN(totIdNumber)) {
        res.status(400).json({
          success: false,
          message: "Invalid ToT ID format",
        });
        return;
      }

      const totMeta = await this.totMetaService.getByToTId(totIdNumber);

      res.status(200).json({
        success: true,
        message: "ToT Meta retrieved successfully",
        data: totMeta,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to fetch ToT Meta",
      });
    }
  };

  // Get ToT Meta by ID
  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const idNumber = parseInt(id);

      if (isNaN(idNumber)) {
        res.status(400).json({
          success: false,
          message: "Invalid ID format",
        });
        return;
      }

      const totMeta = await this.totMetaService.getById(idNumber);

      res.status(200).json({
        success: true,
        message: "ToT Meta retrieved successfully",
        data: totMeta,
      });
    } catch (error) {
      if (error instanceof Error && error.message === "ToT Meta not found") {
        res.status(404).json({
          success: false,
          message: "ToT Meta not found",
        });
        return;
      }

      res.status(500).json({
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to fetch ToT Meta",
      });
    }
  };
}
