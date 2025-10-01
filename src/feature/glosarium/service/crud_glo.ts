import { Glosarium } from "@prisma/client";
import {
  GlosariumRepository,
  UpdateGlosariumData, // CreateGlosariumData dari repo tidak perlu diimpor di sini
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

// Interface untuk Create Glosarium di level Service
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
}

// Interface untuk Update Glosarium di level Service
interface UpdateGlosariumServiceData extends UpdateGlosariumData {} // Bisa langsung extend dari repo

export class GlosariumService {
  private repo: GlosariumRepository;

  constructor() {
    this.repo = new GlosariumRepository();
  }

  /**
   * Create a new Glosarium
   * @param adminId - ID admin dari token JWT
   * @param glosariumBody - Data dari request body
   * @returns Promise<Glosarium>
   */
  async create(
    adminId: string, // <-- PERUBAHAN: Terima adminId sebagai argumen
    glosariumBody: CreateGlosariumServiceData // <-- PERUBAHAN: Gunakan interface baru tanpa admin_id
  ): Promise<Glosarium> {
    try {
      // Gabungkan adminId dengan data body sebelum dikirim ke repository
      const completeData = {
        ...glosariumBody,
        admin_id: adminId,
      };

      // Panggil repository dengan data yang sudah lengkap
      return this.repo.create(completeData);
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
    id: string, // <-- PERUBAHAN: dari number ke string
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
  async deleteById(id: string): Promise<Glosarium> {
    // <-- PERUBAHAN: dari number ke string
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
