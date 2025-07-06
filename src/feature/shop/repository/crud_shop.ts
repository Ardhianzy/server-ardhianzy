import prisma from "../../../config/db";
import { Shop, Prisma } from "@prisma/client";
import {
  SlugGenerator,
  SEOMetaGenerator,
  UtilityFactory,
  generateSlug,
  generateUniqueSlug,
  generateSEOMeta,
  isValidSlug,
  ModelType,
} from "../../../utils/slugify";

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

export interface CreateShopData {
  admin_id: number;
  stock: string;
  title: string;
  category: string;
  price: string;
  link: string;
  desc: string;
  image: string;
  meta_title?: string;
  meta_description?: string;
  is_available?: boolean;
}

export interface UpdateShopData
  extends Partial<Omit<CreateShopData, "admin_id">> {
  slug?: string;
}

export class ShopRepository {
  private slugGenerator = UtilityFactory.getSlugGenerator();
  private seoGenerator = UtilityFactory.getSEOGenerator();

  /**
   * Create a new Shop record
   * @param dataShop - Data untuk membuat Shop baru
   * @returns Promise<Shop> - Record Shop yang baru dibuat
   */
  async create(dataShop: CreateShopData): Promise<Shop> {
    try {
      const slug = await this.slugGenerator.generateUniqueSlug(
        dataShop.title,
        "shop"
      );

      const seoMeta = this.seoGenerator.generateSEOMeta(
        dataShop.title,
        dataShop.desc
      );

      const newShop = await prisma.shop.create({
        data: {
          ...dataShop,
          slug,
          meta_title: dataShop.meta_title || seoMeta.metaTitle,
          meta_description:
            dataShop.meta_description || seoMeta.metaDescription,
        },
      });
      return newShop;
    } catch (error) {
      throw new Error(
        `Failed to create Shop: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Get Shop by title
   * @param title - Title dari Shop yang ingin diambil
   * @returns Promise<Shop | null> - Record Shop atau null jika tidak ditemukan
   */
  async getByTitle(title: string): Promise<Shop | null> {
    try {
      const shop = await prisma.shop.findFirst({
        where: { title },
      });
      return shop;
    } catch (error) {
      throw new Error(
        `Failed to get Shop by title: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Get all Shop records with pagination
   * @param paginationParams - Parameters untuk pagination
   * @returns Promise<PaginatedResult<Shop>> - Data dengan informasi pagination
   */
  async getAll(
    paginationParams: PaginationParams = {}
  ): Promise<PaginatedResult<Shop>> {
    try {
      // Default values untuk pagination
      const page = Math.max(1, paginationParams.page || 1);
      const limit = Math.min(100, Math.max(1, paginationParams.limit || 10)); // Max 100 records per page
      const skip = (page - 1) * limit;
      const sortBy = paginationParams.sortBy || "id";
      const sortOrder = paginationParams.sortOrder || "desc";

      // Execute queries secara parallel untuk performa yang lebih baik
      const [data, total] = await Promise.all([
        prisma.shop.findMany({
          skip,
          take: limit,
          orderBy: {
            [sortBy]: sortOrder,
          },
        }),
        prisma.shop.count(),
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
        `Failed to get Shop list: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Delete Shop by ID
   * @param id - ID dari Shop yang akan dihapus
   * @returns Promise<Shop> - Record Shop yang telah dihapus
   */
  async deleteById(id: number): Promise<Shop> {
    try {
      const deletedShop = await prisma.shop.delete({
        where: { id },
      });

      return deletedShop;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw new Error("Shop not found");
        }
        if (error.code === "P2003") {
          throw new Error("Cannot delete Shop: it has related records");
        }
      }
      throw new Error(
        `Failed to delete Shop: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Update Shop by ID
   * @param id - ID dari Shop yang akan diupdate
   * @param dataShop - Data yang akan diupdate
   * @returns Promise<Shop> - Record Shop yang telah diupdate
   */
  async updateById(id: number, dataShop: UpdateShopData): Promise<Shop> {
    try {
      let updateData = { ...dataShop };

      if (dataShop.title) {
        updateData.slug = await this.slugGenerator.generateUniqueSlug(
          dataShop.title,
          "shop",
          id
        );
      }

      if (dataShop.title || dataShop.desc) {
        const currentShop = await prisma.shop.findUnique({ where: { id } });
        if (currentShop) {
          const title = dataShop.title || currentShop.title;
          const desc = dataShop.desc || currentShop.desc;
          const seoMeta = this.seoGenerator.generateSEOMeta(title, desc);

          if (!dataShop.meta_title) {
            updateData.meta_title = seoMeta.metaTitle;
          }
          if (!dataShop.meta_description) {
            updateData.meta_description = seoMeta.metaDescription;
          }
        }
      }

      const updatedShop = await prisma.shop.update({
        where: { id },
        data: updateData,
      });

      return updatedShop;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw new Error("Shop not found");
        }
      }
      throw new Error(
        `Failed to update Shop: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }
}
