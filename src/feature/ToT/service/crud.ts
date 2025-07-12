import { TotCrudRepo } from "../repository/crud";
import { ToT } from "@prisma/client";
import imagekit from "../../../libs/imageKit";
import path from "path";

// Interface untuk Create ToT
interface CreateTotData {
  image?: Express.Multer.File;
  philosofer: string;
  geoorigin: string;
  detail_location: string;
  years: string;
  meta_title?: string;
  meta_description?: string;
  keywords?: string;
  is_published?: boolean;
  admin_id: number;
}

// Interface untuk Update ToT
interface UpdateTotData {
  image?: Express.Multer.File;
  philosofer?: string;
  geoorigin?: string;
  detail_location?: string;
  years?: string;
  meta_title?: string;
  meta_description?: string;
  keywords?: string;
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

export class TotService {
  private repo: TotCrudRepo;

  constructor() {
    this.repo = new TotCrudRepo();
  }

  // Create ToT
  async create(totData: CreateTotData): Promise<ToT> {
    // Validasi input
    if (!totData.philosofer?.trim()) {
      throw new Error("Philosofer is required");
    }
    if (!totData.geoorigin?.trim()) {
      throw new Error("Geoorigin is required");
    }
    if (!totData.detail_location?.trim()) {
      throw new Error("Detail location is required");
    }
    if (!totData.years?.trim()) {
      throw new Error("Years is required");
    }
    if (!totData.admin_id) {
      throw new Error("Admin ID is required");
    }

    let imageUrl: string | undefined;

    // Upload image jika ada
    if (totData.image) {
      try {
        const fileBase64 = totData.image.buffer.toString("base64");
        const response = await imagekit.upload({
          fileName: Date.now() + path.extname(totData.image.originalname),
          file: fileBase64,
          folder: "Ardianzy/tot",
        });
        imageUrl = response.url;
      } catch (error) {
        throw new Error("Failed to upload image");
      }
    }

    return this.repo.create({
      admin_id: totData.admin_id,
      philosofer: totData.philosofer,
      geoorigin: totData.geoorigin,
      detail_location: totData.detail_location,
      years: totData.years,
      image: imageUrl,
      meta_title: totData.meta_title,
      meta_description: totData.meta_description,
      keywords: totData.keywords,
      is_published: totData.is_published,
    });
  }

  // Get all ToT dengan pagination
  async getAll(
    paginationParams?: PaginationParams
  ): Promise<PaginatedResult<ToT>> {
    return this.repo.getAll(paginationParams || {});
  }

  // Get ToT by ID
  async getById(id: number): Promise<ToT> {
    const tot = await this.repo.getById(id);
    if (!tot) {
      throw new Error("ToT not found");
    }
    return tot;
  }

  // Get ToT by Philosofer
  async getByPhilosofer(philosofer: string): Promise<ToT> {
    if (!philosofer?.trim()) {
      throw new Error("Philosofer name is required");
    }

    const tot = await this.repo.getByPhilosofer(philosofer);
    if (!tot) {
      throw new Error("ToT not found");
    }
    return tot;
  }

  // Update ToT by ID
  async updateById(id: number, totData: UpdateTotData): Promise<ToT> {
    // Check if ToT exists
    const existingToT = await this.repo.getById(id);
    if (!existingToT) {
      throw new Error("ToT not found");
    }

    const updateData: any = {};

    // Only update provided fields
    if (totData.philosofer?.trim()) {
      updateData.philosofer = totData.philosofer;
    }
    if (totData.geoorigin?.trim()) {
      updateData.geoorigin = totData.geoorigin;
    }
    if (totData.detail_location?.trim()) {
      updateData.detail_location = totData.detail_location;
    }
    if (totData.years?.trim()) {
      updateData.years = totData.years;
    }
    if (totData.meta_title?.trim()) {
      updateData.meta_title = totData.meta_title;
    }
    if (totData.meta_description?.trim()) {
      updateData.meta_description = totData.meta_description;
    }
    if (totData.keywords?.trim()) {
      updateData.keywords = totData.keywords;
    }
    if (totData.is_published !== undefined) {
      updateData.is_published = totData.is_published;
    }

    // Upload new image if provided
    if (totData.image) {
      try {
        const fileBase64 = totData.image.buffer.toString("base64");
        const response = await imagekit.upload({
          fileName: Date.now() + path.extname(totData.image.originalname),
          file: fileBase64,
          folder: "Ardianzy/tot",
        });
        updateData.image = response.url;
      } catch (error) {
        throw new Error("Failed to upload image");
      }
    }

    return this.repo.updateById(id, updateData);
  }

  // Delete ToT by ID
  async deleteById(id: number): Promise<ToT> {
    // Check if ToT exists
    const existingToT = await this.repo.getById(id);
    if (!existingToT) {
      throw new Error("ToT not found");
    }

    return this.repo.deleteById(id);
  }
}
