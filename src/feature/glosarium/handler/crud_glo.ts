import { Request, Response } from "express";
import { GlosariumService } from "../service/crud_glo";
import { validationResult } from "express-validator";

export class GlosariumHandler {
  private service: GlosariumService;

  constructor() {
    this.service = new GlosariumService();
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({});
        return;
      }
      const adminId = req.user?.admin_Id;
      if (!adminId) {
        res.status(401).json({
          success: false,
          message: "Authentication failed: User ID not found in token.",
        });
        return;
      }

      const glosariumBody = req.body;

      const newGlosarium = await this.service.create(adminId, glosariumBody);

      res.status(201).json({
        success: true,
        message: "Glosarium created successfully",
        data: newGlosarium,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error instanceof Error ? error.message : "Internal server error",
      });
    }
  }

  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const sortBy = (req.query.sortBy as string) || "created_at";
      const sortOrder = (req.query.sortOrder as "asc" | "desc") || "desc";

      const paginationParams = {
        page,
        limit,
        sortBy,
        sortOrder,
      };

      const result = await this.service.getAll(paginationParams);

      res.status(200).json({
        success: true,
        message: "Glosarium retrieved successfully",
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error instanceof Error ? error.message : "Internal server error",
      });
    }
  }

  async getByDefinition(req: Request, res: Response): Promise<void> {
    try {
      const { definition } = req.params;

      if (!definition) {
        res.status(400).json({
          success: false,
          message: "Definition parameter is required",
        });
        return;
      }

      const glosarium = await this.service.getByDefinition(definition);

      if (!glosarium) {
        res.status(404).json({
          success: false,
          message: "Glosarium not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Glosarium retrieved successfully",
        data: glosarium,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error instanceof Error ? error.message : "Internal server error",
      });
    }
  }

  async updateById(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
        return;
      }
      const { id } = req.params;
      if (!id) {
        res.status(400).json({
          success: false,
          message: "Glosarium ID is required",
        });
        return;
      }

      const updateData = req.body;

      const updatedGlosarium = await this.service.updateById(id, updateData);

      res.status(200).json({
        success: true,
        message: "Glosarium updated successfully",
        data: updatedGlosarium,
      });
    } catch (error) {
      if (error instanceof Error && error.message === "Glosarium not found") {
        res.status(404).json({
          success: false,
          message: "Glosarium not found",
        });
        return;
      }

      res.status(500).json({
        success: false,
        message:
          error instanceof Error ? error.message : "Internal server error",
      });
    }
  }

  async deleteById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({
          success: false,
          message: "Glosarium ID is required",
        });
        return;
      }

      const deletedGlosarium = await this.service.deleteById(id);

      res.status(200).json({
        success: true,
        message: "Glosarium deleted successfully",
        data: deletedGlosarium,
      });
    } catch (error) {
      if (error instanceof Error && error.message === "Glosarium not found") {
        res.status(404).json({
          success: false,
          message: "Glosarium not found",
        });
        return;
      }

      res.status(500).json({
        success: false,
        message:
          error instanceof Error ? error.message : "Internal server error",
      });
    }
  }
}
