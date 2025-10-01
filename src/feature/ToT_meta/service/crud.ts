import { ToTMetaRepository } from "../repository/crud";
import { ToT_meta } from "@prisma/client";

// Interface untuk Create ToT Meta
interface CreateToTMetaData {
  ToT_id: string; // <-- Harus string
  metafisika: string;
  epsimologi: string;
  aksiologi: string;
  conclusion: string;
}

// Interface untuk Update ToT Meta
interface UpdateToTMetaData {
  ToT_id?: string; // <-- Harus string
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
    if (!totMetaData.ToT_id) throw new Error("ToT ID is required");
    if (!totMetaData.metafisika?.trim())
      throw new Error("Metafisika is required");
    // ... validasi lainnya
    return this.repo.createByAdmin(totMetaData);
  }

  // Update ToT Meta by ID (Admin only)
  async updateById(
    id: string,
    totMetaData: UpdateToTMetaData
  ): Promise<ToT_meta> {
    // <-- id harus string
    const existingToTMeta = await this.repo.getById(id);
    if (!existingToTMeta) {
      throw new Error("ToT Meta not found");
    }
    return this.repo.updateById(id, totMetaData);
  }

  // Delete ToT Meta by ID (Admin only)
  async deleteById(id: string): Promise<ToT_meta> {
    // <-- id harus string
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
  async getByToTId(totId: string): Promise<ToT_meta[]> {
    // <-- totId harus string
    if (!totId) {
      throw new Error("ToT ID is required");
    }
    return this.repo.getByToTId(totId);
  }

  // Get ToT Meta by ID
  async getById(id: string): Promise<ToT_meta> {
    // <-- id harus string
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
