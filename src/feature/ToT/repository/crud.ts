import prisma from "../../../config/db";
import { ToT, Prisma } from "@prisma/client";

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

export class TotCrudRepo {
  /**
   * Create a new ToT record
   * @param dataToT - Data untuk membuat ToT baru
   * @returns Promise<ToT> - Record ToT yang baru dibuat
   */
  async create(dataToT: {
    admin_id: number;
    image?: string;
    philosofer: string;
    geoorigin: string;
    detail_location: string;
    years: string;
  }): Promise<ToT> {
    try {
      const newToT = await prisma.toT.create({
        data: dataToT,
      });
      return newToT;
    } catch (error) {
      throw new Error(
        `Failed to create ToT: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Get all ToT records with pagination
   * @param paginationParams - Parameters untuk pagination
   * @returns Promise<PaginatedResult<ToT>> - Data dengan informasi pagination
   */
  async getAll(
    paginationParams: PaginationParams = {}
  ): Promise<PaginatedResult<ToT>> {
    try {
      // Default values untuk pagination
      const page = Math.max(1, paginationParams.page || 1);
      const limit = Math.min(100, Math.max(1, paginationParams.limit || 10)); // Max 100 records per page
      const skip = (page - 1) * limit;
      const sortBy = paginationParams.sortBy || "id";
      const sortOrder = paginationParams.sortOrder || "desc";

      // Execute queries secara parallel untuk performa yang lebih baik
      const [data, total] = await Promise.all([
        prisma.toT.findMany({
          skip,
          take: limit,
          orderBy: {
            [sortBy]: sortOrder,
          },
        }),
        prisma.toT.count(),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        data,
        pagination: {
          total,
          page,
          limit,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      };
    } catch (error) {
      throw new Error(
        `Failed to get ToT list: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Get ToT by ID
   * @param id - ID dari ToT yang ingin diambil
   * @returns Promise<ToT | null> - Record ToT atau null jika tidak ditemukan
   */
  async getById(id: number): Promise<ToT | null> {
    try {
      const tot = await prisma.toT.findUnique({
        where: { id },
      });
      return tot;
    } catch (error) {
      throw new Error(
        `Failed to get ToT by ID: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Update ToT by ID
   * @param id - ID dari ToT yang akan diupdate
   * @param dataToT - Data yang akan diupdate
   * @returns Promise<ToT> - Record ToT yang telah diupdate
   */
  async updateById(id: number, dataToT: Prisma.ToTUpdateInput): Promise<ToT> {
    try {
      const updatedToT = await prisma.toT.update({
        where: { id },
        data: dataToT,
      });

      return updatedToT;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw new Error("ToT not found");
        }
      }
      throw new Error(
        `Failed to update ToT: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Delete ToT by ID
   * @param id - ID dari ToT yang akan dihapus
   * @returns Promise<ToT> - Record ToT yang telah dihapus
   */
  async deleteById(id: number): Promise<ToT> {
    try {
      const deletedToT = await prisma.toT.delete({
        where: { id },
      });

      return deletedToT;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw new Error("ToT not found");
        }
        if (error.code === "P2003") {
          throw new Error("Cannot delete ToT: it has related records");
        }
      }
      throw new Error(
        `Failed to delete ToT: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }
}
