import { ToTMetaRepository } from "../repository/crud";
import { ToT_meta } from "@prisma/client";

// Interface untuk Create ToT Meta
interface CreateToTMetaData {
  ToT_id: number;
  metafisika: string;
  epsimologi: string;
  aksiologi: string;
  conclusion: string;
}

// Interface untuk Update ToT Meta
interface UpdateToTMetaData {
  ToT_id?: number;
  metafisika?: string;
  epsimologi?: string;
  aksiologi?: string;
  conclusion?: string;
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

export class ToTMetaService {
  private repo: ToTMetaRepository;

  constructor() {
    this.repo = new ToTMetaRepository();
  }

  // Create ToT Meta (Admin only)
  async createByAdmin(totMetaData: CreateToTMetaData): Promise<ToT_meta> {
    // Validasi input
    if (!totMetaData.ToT_id) {
      throw new Error("ToT ID is required");
    }
    if (!totMetaData.metafisika?.trim()) {
      throw new Error("Metafisika is required");
    }
    if (!totMetaData.epsimologi?.trim()) {
      throw new Error("Epsimologi is required");
    }
    if (!totMetaData.aksiologi?.trim()) {
      throw new Error("Aksiologi is required");
    }
    if (!totMetaData.conclusion?.trim()) {
      throw new Error("Conclusion is required");
    }

    return this.repo.createByAdmin({
      ToT_id: totMetaData.ToT_id,
      metafisika: totMetaData.metafisika,
      epsimologi: totMetaData.epsimologi,
      aksiologi: totMetaData.aksiologi,
      conclusion: totMetaData.conclusion,
    });
  }

  // Update ToT Meta by ID (Admin only)
  async updateById(
    id: number,
    totMetaData: UpdateToTMetaData
  ): Promise<ToT_meta> {
    // Check if ToT Meta exists
    const existingToTMeta = await this.repo.getById(id);
    if (!existingToTMeta) {
      throw new Error("ToT Meta not found");
    }

    const updateData: any = {};

    // Only update provided fields
    if (totMetaData.ToT_id !== undefined) {
      updateData.ToT_id = totMetaData.ToT_id;
    }
    if (totMetaData.metafisika?.trim()) {
      updateData.metafisika = totMetaData.metafisika;
    }
    if (totMetaData.epsimologi?.trim()) {
      updateData.epsimologi = totMetaData.epsimologi;
    }
    if (totMetaData.aksiologi?.trim()) {
      updateData.aksiologi = totMetaData.aksiologi;
    }
    if (totMetaData.conclusion?.trim()) {
      updateData.conclusion = totMetaData.conclusion;
    }

    return this.repo.updateById(id, updateData);
  }

  // Delete ToT Meta by ID (Admin only)
  async deleteById(id: number): Promise<ToT_meta> {
    // Check if ToT Meta exists
    const existingToTMeta = await this.repo.getById(id);
    if (!existingToTMeta) {
      throw new Error("ToT Meta not found");
    }

    return this.repo.deleteById(id);
  }

  // Get all ToT Meta dengan pagination
  async getAll(
    paginationParams?: PaginationParams
  ): Promise<PaginatedResult<ToT_meta>> {
    return this.repo.getAll(paginationParams || {});
  }

  // Get ToT Meta by ToT ID
  async getByToTId(totId: number): Promise<ToT_meta[]> {
    if (!totId) {
      throw new Error("ToT ID is required");
    }

    const totMeta = await this.repo.getByToTId(totId);
    return totMeta;
  }

  // Get ToT Meta by ID
  async getById(id: number): Promise<ToT_meta> {
    if (!id) {
      throw new Error("ToT Meta ID is required");
    }

    const totMeta = await this.repo.getById(id);
    if (!totMeta) {
      throw new Error("ToT Meta not found");
    }
    return totMeta;
  }
}
