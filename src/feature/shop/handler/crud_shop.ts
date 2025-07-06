import { Request, Response } from "express";
import { ShopService } from "../service/crud_shop";
import { validationResult } from "express-validator";

export class ShopHandler {
  private service: ShopService;

  constructor() {
    this.service = new ShopService();
  }

  /**
   * Create a new Shop (Admin only)
   * @param req - Express Request
   * @param res - Express Response
   */
  async create(req: Request, res: Response): Promise<void> {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
        return;
      }

      const shopData = {
        ...req.body,
        image: req.file,
      };

      const newShop = await this.service.create(shopData);

      res.status(201).json({
        success: true,
        message: "Shop created successfully",
        data: newShop,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error instanceof Error ? error.message : "Internal server error",
      });
    }
  }

  /**
   * Get Shop by title
   * @param req - Express Request
   * @param res - Express Response
   */
  async getByTitle(req: Request, res: Response): Promise<void> {
    try {
      const { title } = req.params;

      if (!title) {
        res.status(400).json({
          success: false,
          message: "Title parameter is required",
        });
        return;
      }

      const shop = await this.service.getByTitle(title);

      if (!shop) {
        res.status(404).json({
          success: false,
          message: "Shop not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Shop retrieved successfully",
        data: shop,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error instanceof Error ? error.message : "Internal server error",
      });
    }
  }

  /**
   * Get all Shops with pagination
   * @param req - Express Request
   * @param res - Express Response
   */
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const sortBy = (req.query.sortBy as string) || "id";
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
        message: "Shops retrieved successfully",
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

  /**
   * Delete Shop by ID (Admin only)
   * @param req - Express Request
   * @param res - Express Response
   */
  async deleteById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const shopId = parseInt(id);

      if (isNaN(shopId)) {
        res.status(400).json({
          success: false,
          message: "Invalid shop ID",
        });
        return;
      }

      const deletedShop = await this.service.deleteById(shopId);

      res.status(200).json({
        success: true,
        message: "Shop deleted successfully",
        data: deletedShop,
      });
    } catch (error) {
      if (error instanceof Error && error.message === "Shop not found") {
        res.status(404).json({
          success: false,
          message: "Shop not found",
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

  /**
   * Update Shop by ID (Admin only)
   * @param req - Express Request
   * @param res - Express Response
   */
  async updateById(req: Request, res: Response): Promise<void> {
    try {
      // Check validation errors
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
      const shopId = parseInt(id);

      if (isNaN(shopId)) {
        res.status(400).json({
          success: false,
          message: "Invalid shop ID",
        });
        return;
      }

      const updateData = {
        ...req.body,
        image: req.file,
      };

      const updatedShop = await this.service.updateById(shopId, updateData);

      res.status(200).json({
        success: true,
        message: "Shop updated successfully",
        data: updatedShop,
      });
    } catch (error) {
      if (error instanceof Error && error.message === "Shop not found") {
        res.status(404).json({
          success: false,
          message: "Shop not found",
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
