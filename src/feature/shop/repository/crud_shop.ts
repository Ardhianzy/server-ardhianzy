import prisma from "../../../config/db";
import { Shop, Prisma } from "@prisma/client";
import { UtilityFactory } from "../../../utils/slugify";

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
  admin_id: string; // ← cuid string
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

  // Batasi field sort agar aman untuk Prisma
  private readonly sortableFields = new Set<keyof Shop | string>([
    "id",
    "title",
    "category",
    "price",
    "is_available",
    "slug",
    "created_at",
    "updated_at",
  ]);

  /**
   * Create a new Shop record
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
          meta_title: dataShop.meta_title ?? seoMeta.metaTitle,
          meta_description:
            dataShop.meta_description ?? seoMeta.metaDescription,
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
   */
  async getAll(
    paginationParams: PaginationParams = {}
  ): Promise<PaginatedResult<Shop>> {
    try {
      const page = Math.max(1, paginationParams.page ?? 1);
      const limit = Math.min(100, Math.max(1, paginationParams.limit ?? 10));
      const skip = (page - 1) * limit;

      const sortByRaw = paginationParams.sortBy ?? "created_at";
      const sortBy = this.sortableFields.has(sortByRaw)
        ? (sortByRaw as keyof Shop)
        : ("created_at" as keyof Shop);

      const sortOrder = paginationParams.sortOrder ?? "desc";

      const [data, total] = await Promise.all([
        prisma.shop.findMany({
          skip,
          take: limit,
          orderBy: {
            [sortBy]: sortOrder,
          } as any, // aman karena sudah whitelist
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
   */
  async deleteById(id: string): Promise<Shop> {
    // ← string cuid
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
   */
  async updateById(id: string, dataShop: UpdateShopData): Promise<Shop> {
    try {
      let updateData: UpdateShopData = { ...dataShop };

      // Regenerate slug jika title diubah
      if (dataShop.title) {
        updateData.slug = await this.slugGenerator.generateUniqueSlug(
          dataShop.title,
          "shop",
          id // exclude current record
        );
      }

      // Regenerate SEO meta jika title/desc diubah
      if (dataShop.title || dataShop.desc) {
        const currentShop = await prisma.shop.findUnique({ where: { id } });
        if (currentShop) {
          const title = dataShop.title ?? currentShop.title;
          const desc = dataShop.desc ?? currentShop.desc;
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
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        throw new Error("Shop not found");
      }
      throw new Error(
        `Failed to update Shop: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }
}
