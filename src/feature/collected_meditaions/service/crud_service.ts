import { CollectedMeditationsRepository } from "../repository/crud_colled";
import { Collected_meditations } from "@prisma/client";
import imagekit from "../../../libs/imageKit";
import path from "path";

// Interface untuk Create Collected Meditations
interface CreateCollectedMeditationsData {
  image?: Express.Multer.File;
  dialog: string;
  judul: string;
  meta_title?: string;
  meta_description?: string;
  is_published?: boolean;
  admin_id: number;
}

// Interface untuk Update Collected Meditations
interface UpdateCollectedMeditationsData {
  image?: Express.Multer.File;
  dialog?: string;
  judul?: string;
  meta_title?: string;
  meta_description?: string;
  is_published?: boolean;
}

// Interface untuk Pagination
interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// Interface untuk Pagination Result
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

export class CollectedMeditationsService {
  private repo: CollectedMeditationsRepository;

  constructor() {
    this.repo = new CollectedMeditationsRepository();
  }

  // Create Collected Meditations (Admin only)
  async createByAdmin(
    collectedMeditationsData: CreateCollectedMeditationsData
  ): Promise<Collected_meditations> {
    // Validasi input
    if (!collectedMeditationsData.dialog?.trim()) {
      throw new Error("Dialog is required");
    }
    if (!collectedMeditationsData.judul?.trim()) {
      throw new Error("Judul is required");
    }
    if (!collectedMeditationsData.admin_id) {
      throw new Error("Admin ID is required");
    }

    let imageUrl: string | undefined;

    // Upload image jika ada
    if (collectedMeditationsData.image) {
      try {
        const fileBase64 =
          collectedMeditationsData.image.buffer.toString("base64");
        const response = await imagekit.upload({
          fileName:
            Date.now() +
            path.extname(collectedMeditationsData.image.originalname),
          file: fileBase64,
          folder: "Ardianzy/collected_meditations",
        });
        imageUrl = response.url;
      } catch (error) {
        throw new Error("Failed to upload image");
      }
    }

    return this.repo.createByAdmin({
      admin_id: collectedMeditationsData.admin_id,
      dialog: collectedMeditationsData.dialog,
      judul: collectedMeditationsData.judul,
      image: imageUrl,
      meta_title: collectedMeditationsData.meta_title,
      meta_description: collectedMeditationsData.meta_description,
      is_published: collectedMeditationsData.is_published,
    });
  }

  // Update Collected Meditations by ID (Admin only)
  async updateById(
    id: number,
    collectedMeditationsData: UpdateCollectedMeditationsData
  ): Promise<Collected_meditations> {
    // Check if Collected Meditations exists
    const existingCollectedMeditations = await this.repo.getByJudul("");
    if (!existingCollectedMeditations) {
      // Verify existence by checking get all and finding by id
      const allCollectedMeditations = await this.repo.getAll({
        page: 1,
        limit: 1,
      });
      const found = allCollectedMeditations.data.find((cm) => cm.id === id);
      if (!found) {
        throw new Error("Collected Meditations not found");
      }
    }

    const updateData: any = {};

    // Only update provided fields
    if (collectedMeditationsData.dialog?.trim()) {
      updateData.dialog = collectedMeditationsData.dialog;
    }
    if (collectedMeditationsData.judul?.trim()) {
      updateData.judul = collectedMeditationsData.judul;
    }
    if (collectedMeditationsData.meta_title?.trim()) {
      updateData.meta_title = collectedMeditationsData.meta_title;
    }
    if (collectedMeditationsData.meta_description?.trim()) {
      updateData.meta_description = collectedMeditationsData.meta_description;
    }
    if (collectedMeditationsData.is_published !== undefined) {
      updateData.is_published = collectedMeditationsData.is_published;
    }

    // Upload new image if provided
    if (collectedMeditationsData.image) {
      try {
        const fileBase64 =
          collectedMeditationsData.image.buffer.toString("base64");
        const response = await imagekit.upload({
          fileName:
            Date.now() +
            path.extname(collectedMeditationsData.image.originalname),
          file: fileBase64,
          folder: "Ardianzy/collected_meditations",
        });
        updateData.image = response.url;
      } catch (error) {
        throw new Error("Failed to upload image");
      }
    }

    return this.repo.updateById(id, updateData);
  }

  // Delete Collected Meditations by ID (Admin only)
  async deleteById(id: number): Promise<Collected_meditations> {
    // Check if Collected Meditations exists by trying to get one with similar approach
    try {
      return await this.repo.deleteById(id);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "Collected Meditations not found"
      ) {
        throw new Error("Collected Meditations not found");
      }
      throw error;
    }
  }

  // Get all Collected Meditations dengan pagination
  async getAll(
    paginationParams?: PaginationParams
  ): Promise<PaginatedResult<Collected_meditations>> {
    return this.repo.getAll(paginationParams || {});
  }

  // Get Collected Meditations by judul
  async getByJudul(judul: string): Promise<Collected_meditations> {
    const collectedMeditations = await this.repo.getByJudul(judul);
    if (!collectedMeditations) {
      throw new Error("Collected Meditations not found");
    }
    return collectedMeditations;
  }
}
