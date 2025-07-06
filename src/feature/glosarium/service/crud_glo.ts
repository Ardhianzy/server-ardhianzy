import { Glosarium } from "@prisma/client";
import {
  GlosariumRepository,
  CreateGlosariumData,
  UpdateGlosariumData,
} from "../repository/crud_glo";

// Interface untuk pagination
interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

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

// Interface untuk Create Glosarium
interface CreateGlosariumServiceData {
  term: string;
  definition: string;
  meta_title?: string;
  meta_description?: string;
  keywords?: string;
  etymology?: string;
  examples?: string;
  related_terms?: string;
  is_published?: boolean;
  admin_id: number;
}

// Interface untuk Update Glosarium
interface UpdateGlosariumServiceData {
  term?: string;
  definition?: string;
  meta_title?: string;
  meta_description?: string;
  keywords?: string;
  etymology?: string;
  examples?: string;
  related_terms?: string;
  is_published?: boolean;
}

export class GlosariumService {
  private repo: GlosariumRepository;

  constructor() {
    this.repo = new GlosariumRepository();
  }

  /**
   * Create a new Glosarium (Admin only)
   * @param glosariumData - Data untuk membuat Glosarium baru
   * @returns Promise<Glosarium> - Record Glosarium yang baru dibuat
   */
  async createByAdminId(
    glosariumData: CreateGlosariumServiceData
  ): Promise<Glosarium> {
    try {
      return this.repo.createByAdminId({
        admin_id: glosariumData.admin_id,
        term: glosariumData.term,
        definition: glosariumData.definition,
        meta_title: glosariumData.meta_title,
        meta_description: glosariumData.meta_description,
        keywords: glosariumData.keywords,
        etymology: glosariumData.etymology,
        examples: glosariumData.examples,
        related_terms: glosariumData.related_terms,
        is_published: glosariumData.is_published,
      });
    } catch (error) {
      throw new Error(
        `Failed to create Glosarium: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Get all Glosarium records with pagination
   * @param paginationParams - Parameters untuk pagination
   * @returns Promise<PaginatedResult<Glosarium>> - Data dengan informasi pagination
   */
  async getAll(
    paginationParams: PaginationParams = {}
  ): Promise<PaginatedResult<Glosarium>> {
    try {
      return await this.repo.getAll(paginationParams);
    } catch (error) {
      throw new Error(
        `Failed to get Glosarium list: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Get Glosarium by definition
   * @param definition - Definition dari Glosarium yang ingin diambil
   * @returns Promise<Glosarium | null> - Record Glosarium atau null jika tidak ditemukan
   */
  async getByDefinition(definition: string): Promise<Glosarium | null> {
    try {
      return await this.repo.getByDefinition(definition);
    } catch (error) {
      throw new Error(
        `Failed to get Glosarium by definition: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Update Glosarium by ID (Admin only)
   * @param id - ID dari Glosarium yang akan diupdate
   * @param glosariumData - Data yang akan diupdate
   * @returns Promise<Glosarium> - Record Glosarium yang telah diupdate
   */
  async updateById(
    id: number,
    glosariumData: UpdateGlosariumServiceData
  ): Promise<Glosarium> {
    try {
      return await this.repo.updateById(id, glosariumData);
    } catch (error) {
      throw new Error(
        `Failed to update Glosarium: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Delete Glosarium by ID (Admin only)
   * @param id - ID dari Glosarium yang akan dihapus
   * @returns Promise<Glosarium> - Record Glosarium yang telah dihapus
   */
  async deleteById(id: number): Promise<Glosarium> {
    try {
      return await this.repo.deleteById(id);
    } catch (error) {
      throw new Error(
        `Failed to delete Glosarium: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }
}
