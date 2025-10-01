import { Request, Response } from "express";
import { CollectedMeditationsService } from "../service/crud_service";

// --- GLOBAL DECLARATION (disarankan: gunakan req.user) ---
declare global {
  namespace Express {
    interface UserAuthPayload {
      admin_Id: string;
      username: string;
    }
    interface Request {
      user?: UserAuthPayload; // <-- middleware authenticate mengisi ini
      file?: Express.Multer.File;
    }
  }
}

export class CollectedMeditationsHandler {
  private collectedMeditationsService: CollectedMeditationsService;

  constructor() {
    this.collectedMeditationsService = new CollectedMeditationsService();
  }

  // Create Collected Meditations (Admin only)
  createByAdmin = async (req: Request, res: Response): Promise<void> => {
    try {
      const adminId = req.user?.admin_Id || (req as any).user?.admin_Id;
      if (!adminId) {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
      }

      const newCollectedMeditations =
        await this.collectedMeditationsService.createByAdmin({
          dialog: req.body.dialog,
          judul: req.body.judul,
          meta_title: req.body.meta_title,
          meta_description: req.body.meta_description,
          is_published:
            req.body.is_published === "true" || req.body.is_published === true,
          image: req.file, // biar service yang handle upload -> URL
          adminId, // <-- kunci: diteruskan ke service
          // NOTE: slug tidak dikirim; repo sudah auto-generate slug
        } as any); // cast ringan jika TS complain dari typing bawaan

      res.status(201).json({
        success: true,
        message: "Collected Meditations created successfully",
        data: newCollectedMeditations,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to create Collected Meditations",
      });
    }
  };

  // Update Collected Meditations by ID (Admin only)
  updateById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const updateData: any = {
        dialog: req.body.dialog,
        judul: req.body.judul,
        meta_title: req.body.meta_title,
        meta_description: req.body.meta_description,
        image: req.file,
      };

      if (req.body.is_published !== undefined) {
        updateData.is_published =
          req.body.is_published === "true" || req.body.is_published === true;
      }

      const updatedCollectedMeditations =
        await this.collectedMeditationsService.updateById(id, updateData);

      res.status(200).json({
        success: true,
        message: "Collected Meditations updated successfully",
        data: updatedCollectedMeditations,
      });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "Collected Meditations not found"
      ) {
        res
          .status(404)
          .json({ success: false, message: "Collected Meditations not found" });
        return;
      }

      res.status(500).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to update Collected Meditations",
      });
    }
  };

  // Delete Collected Meditations by ID (Admin only)
  deleteById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const deletedCollectedMeditations =
        await this.collectedMeditationsService.deleteById(id);

      res.status(200).json({
        success: true,
        message: "Collected Meditations deleted successfully",
        data: deletedCollectedMeditations,
      });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "Collected Meditations not found"
      ) {
        res
          .status(404)
          .json({ success: false, message: "Collected Meditations not found" });
        return;
      }
      res.status(500).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to delete Collected Meditations",
      });
    }
  };

  // Get all Collected Meditations dengan pagination
  getAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const sortBy = (req.query.sortBy as string) || "created_at";
      const sortOrder = (req.query.sortOrder as "asc" | "desc") || "desc";

      const result = await this.collectedMeditationsService.getAll({
        page,
        limit,
        sortBy,
        sortOrder,
      });

      res.status(200).json({
        success: true,
        message: "Collected Meditations retrieved successfully",
        ...result,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch Collected Meditations list",
      });
    }
  };

  // Get by ID
  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const meditation = await this.collectedMeditationsService.getById(id);
      res.status(200).json({
        success: true,
        message: "Collected Meditations retrieved successfully",
        data: meditation,
      });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "Collected Meditations not found"
      ) {
        res
          .status(404)
          .json({ success: false, message: "Collected Meditations not found" });
        return;
      }
      res.status(500).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch Collected Meditations",
      });
    }
  };

  // Get by judul
  getByJudul = async (req: Request, res: Response): Promise<void> => {
    try {
      const { judul } = req.params;

      const collectedMeditations =
        await this.collectedMeditationsService.getByJudul(judul);

      res.status(200).json({
        success: true,
        message: "Collected Meditations retrieved successfully",
        data: collectedMeditations,
      });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "Collected Meditations not found"
      ) {
        res
          .status(404)
          .json({ success: false, message: "Collected Meditations not found" });
        return;
      }
      res.status(500).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch Collected Meditations",
      });
    }
  };
}
