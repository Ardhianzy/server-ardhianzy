import { CollectedMeditationsRepository } from "../repository/crud_colled";
import { Collected_meditations } from "@prisma/client";
import imagekit from "../../../libs/imageKit";
import path from "path";

// Interface untuk Create Collected Meditations
// ⬇️ Tambah adminId agar bisa connect ke Admin di repository
interface CreateCollectedMeditationsData {
  image?: Express.Multer.File;
  dialog: string;
  judul: string;
  meta_title?: string;
  meta_description?: string;
  is_published?: boolean;
  adminId: string; // <-- WAJIB (ambil dari req.user.admin_Id di handler)
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
    data: CreateCollectedMeditationsData
  ): Promise<Collected_meditations> {
    if (!data.dialog?.trim()) throw new Error("Dialog is required");
    if (!data.judul?.trim()) throw new Error("Judul is required");
    if (!data.adminId?.trim()) throw new Error("Admin ID is required");

    let imageUrl: string | undefined;

    if (data.image) {
      try {
        const fileBase64 = data.image.buffer.toString("base64");
        const response = await imagekit.upload({
          fileName: Date.now() + path.extname(data.image.originalname),
          file: fileBase64,
          folder: "Ardianzy/collected_meditations",
        });
        imageUrl = response.url;
      } catch {
        throw new Error("Failed to upload image");
      }
    }

    // Kirim ke repository termasuk adminId (kunci untuk connect relasi)
    return this.repo.createByAdmin({
      image: imageUrl, // convert file -> URL string
      dialog: data.dialog,
      judul: data.judul,
      meta_title: data.meta_title,
      meta_description: data.meta_description,
      is_published: data.is_published,
      adminId: data.adminId, // <-- penting
    });
  }

  // Update Collected Meditations by ID (Admin only)
  async updateById(
    id: string,
    data: UpdateCollectedMeditationsData
  ): Promise<Collected_meditations> {
    await this.getById(id); // Check if data exists, throws error if not

    const updateData: { [key: string]: any } = {};

    if (data.dialog?.trim()) updateData.dialog = data.dialog;
    if (data.judul?.trim()) updateData.judul = data.judul;
    if (data.meta_title?.trim()) updateData.meta_title = data.meta_title;
    if (data.meta_description?.trim())
      updateData.meta_description = data.meta_description;
    if (data.is_published !== undefined)
      updateData.is_published = data.is_published;

    if (data.image) {
      try {
        const fileBase64 = data.image.buffer.toString("base64");
        const response = await imagekit.upload({
          fileName: Date.now() + path.extname(data.image.originalname),
          file: fileBase64,
          folder: "Ardianzy/collected_meditations",
        });
        updateData.image = response.url;
      } catch {
        throw new Error("Failed to upload image");
      }
    }

    return this.repo.updateById(id, updateData);
  }

  // Delete Collected Meditations by ID (Admin only)
  async deleteById(id: string): Promise<Collected_meditations> {
    await this.getById(id); // Check if data exists, throws error if not
    return this.repo.deleteById(id);
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

  // Get by ID
  async getById(id: string): Promise<Collected_meditations> {
    const meditation = await this.repo.getById(id);
    if (!meditation) {
      throw new Error("Collected Meditations not found");
    }
    return meditation;
  }
}
