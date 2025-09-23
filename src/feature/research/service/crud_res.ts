import { ResearchRepository } from "../repository/crud_res";
import { Research } from "@prisma/client";
import imagekit from "../../../libs/imageKit";
import path from "path";

// Interface untuk Create Research
interface CreateResearchData {
  image?: Express.Multer.File;
  research_title: string;
  research_sum: string;
  researcher: string;
  research_date: Date;
  meta_title?: string;
  meta_description?: string;
  keywords?: string;
  is_published?: boolean;
  admin_id: string; // ← cuid string
}

// Interface untuk Update Research
interface UpdateResearchData {
  image?: Express.Multer.File;
  research_title?: string;
  research_sum?: string;
  researcher?: string;
  research_date?: Date;
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

export class ResearchService {
  private repo: ResearchRepository;

  constructor() {
    this.repo = new ResearchRepository();
  }

  // Create Research (Admin only)
  async createByAdmin(researchData: CreateResearchData): Promise<Research> {
    // Validasi input
    if (!researchData.research_title?.trim()) {
      throw new Error("Research title is required");
    }
    if (!researchData.research_sum?.trim()) {
      throw new Error("Research summary is required");
    }
    if (!researchData.researcher?.trim()) {
      throw new Error("Researcher is required");
    }
    if (!researchData.research_date) {
      throw new Error("Research date is required");
    }
    if (!researchData.admin_id?.trim()) {
      throw new Error("Admin ID is required");
    }

    let imageUrl: string | undefined;

    // Upload image jika ada
    if (researchData.image) {
      try {
        const fileBase64 = researchData.image.buffer.toString("base64");
        const response = await imagekit.upload({
          fileName: Date.now() + path.extname(researchData.image.originalname),
          file: fileBase64,
          folder: "Ardianzy/research",
        });
        imageUrl = response.url;
      } catch {
        throw new Error("Failed to upload image");
      }
    }

    if (!imageUrl) {
      throw new Error("Image is required");
    }

    return this.repo.createByAdmin({
      admin_id: researchData.admin_id, // ← string
      research_title: researchData.research_title,
      research_sum: researchData.research_sum,
      image: imageUrl,
      researcher: researchData.researcher,
      research_date: researchData.research_date,
      meta_title: researchData.meta_title,
      meta_description: researchData.meta_description,
      keywords: researchData.keywords,
      is_published: researchData.is_published,
    });
  }

  // Update Research by ID (Admin only)
  async updateById(
    id: string,
    researchData: UpdateResearchData
  ): Promise<Research> {
    if (!id?.trim()) throw new Error("Valid Research ID is required");

    const updateData: any = {};

    // Only update provided fields
    if (researchData.research_title?.trim()) {
      updateData.research_title = researchData.research_title.trim();
    }
    if (researchData.research_sum?.trim()) {
      updateData.research_sum = researchData.research_sum.trim();
    }
    if (researchData.researcher?.trim()) {
      updateData.researcher = researchData.researcher.trim();
    }
    if (researchData.research_date) {
      updateData.research_date = researchData.research_date;
    }
    if (researchData.meta_title?.trim()) {
      updateData.meta_title = researchData.meta_title.trim();
    }
    if (researchData.meta_description?.trim()) {
      updateData.meta_description = researchData.meta_description.trim();
    }
    if (researchData.keywords?.trim()) {
      updateData.keywords = researchData.keywords.trim();
    }
    if (researchData.is_published !== undefined) {
      updateData.is_published = researchData.is_published;
    }

    // Upload new image if provided
    if (researchData.image) {
      try {
        const fileBase64 = researchData.image.buffer.toString("base64");
        const response = await imagekit.upload({
          fileName: Date.now() + path.extname(researchData.image.originalname),
          file: fileBase64,
          folder: "Ardianzy/research",
        });
        updateData.image = response.url;
      } catch {
        throw new Error("Failed to upload image");
      }
    }

    // Andalkan repo untuk melempar "Research not found" (P2025) bila ID tidak ada
    return this.repo.updateById(id, updateData);
  }

  // Delete Research by ID (Admin only)
  async deleteById(id: string): Promise<Research> {
    if (!id?.trim()) throw new Error("Valid Research ID is required");
    return this.repo.deleteById(id);
  }

  // Get all Research dengan pagination
  async getAll(
    paginationParams?: PaginationParams
  ): Promise<PaginatedResult<Research>> {
    return this.repo.getAll(paginationParams || {});
  }

  // Get Research by research title
  async getByResearchTitle(researchTitle: string): Promise<Research> {
    if (!researchTitle?.trim()) {
      throw new Error("Research title is required");
    }
    const research = await this.repo.getByResearchTitle(researchTitle.trim());
    if (!research) {
      throw new Error("Research not found");
    }
    return research;
  }
}
