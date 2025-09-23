import { Shop } from "@prisma/client";
import {
  ShopRepository,
  UpdateShopData as RepoUpdateShopData,
} from "../repository/crud_shop";
import imagekit from "../../../libs/imageKit";
import path from "path";

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

// Interface untuk Create Shop (admin_id string/cuid)
interface CreateShopData {
  image?: Express.Multer.File;
  stock: string;
  title: string;
  category: string;
  price: string;
  link: string;
  desc: string;
  meta_title?: string;
  meta_description?: string;
  is_available?: boolean;
  admin_id: string; // ← string (cuid)
}

// Interface untuk Update Shop
interface UpdateShopData {
  image?: Express.Multer.File;
  stock?: string;
  title?: string;
  category?: string;
  price?: string;
  link?: string;
  desc?: string;
  meta_title?: string;
  meta_description?: string;
  is_available?: boolean;
}

export class ShopService {
  private repo: ShopRepository;

  constructor() {
    this.repo = new ShopRepository();
  }

  /**
   * Create a new Shop
   */
  async create(shopData: CreateShopData): Promise<Shop> {
    try {
      if (!shopData.admin_id?.trim()) throw new Error("Admin ID is required");
      if (!shopData.title?.trim()) throw new Error("Title is required");
      if (!shopData.stock?.trim()) throw new Error("Stock is required");
      if (!shopData.category?.trim()) throw new Error("Category is required");
      if (!shopData.price?.trim()) throw new Error("Price is required");
      if (!shopData.link?.trim()) throw new Error("Link is required");
      if (!shopData.desc?.trim()) throw new Error("Description is required");

      let imageUrl: string | undefined;

      // Upload image jika ada
      if (shopData.image) {
        try {
          const fileBase64 = shopData.image.buffer.toString("base64");
          const response = await imagekit.upload({
            fileName: Date.now() + path.extname(shopData.image.originalname),
            file: fileBase64,
            folder: "Ardianzy/shop",
          });
          imageUrl = response.url;
        } catch {
          throw new Error("Failed to upload image");
        }
      }

      return this.repo.create({
        admin_id: shopData.admin_id, // ← string
        stock: shopData.stock,
        title: shopData.title,
        category: shopData.category,
        price: shopData.price,
        link: shopData.link,
        desc: shopData.desc,
        image: imageUrl || "",
        meta_title: shopData.meta_title,
        meta_description: shopData.meta_description,
        is_available: shopData.is_available,
      });
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
      return await this.repo.getByTitle(title);
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
      return await this.repo.getAll(paginationParams);
    } catch (error) {
      throw new Error(
        `Failed to get Shop list: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Delete Shop by ID (cuid string)
   */
  async deleteById(id: string): Promise<Shop> {
    try {
      if (!id?.trim()) throw new Error("Valid Shop ID is required");
      return await this.repo.deleteById(id); // ← string
    } catch (error) {
      throw new Error(
        `Failed to delete Shop: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Update Shop by ID (cuid string)
   */
  async updateById(id: string, shopData: UpdateShopData): Promise<Shop> {
    try {
      if (!id?.trim()) throw new Error("Valid Shop ID is required");

      const updateData: RepoUpdateShopData = {};

      // Copy all properties except image
      if (shopData.stock !== undefined) updateData.stock = shopData.stock;
      if (shopData.title !== undefined) updateData.title = shopData.title;
      if (shopData.category !== undefined)
        updateData.category = shopData.category;
      if (shopData.price !== undefined) updateData.price = shopData.price;
      if (shopData.link !== undefined) updateData.link = shopData.link;
      if (shopData.desc !== undefined) updateData.desc = shopData.desc;
      if (shopData.meta_title !== undefined)
        updateData.meta_title = shopData.meta_title;
      if (shopData.meta_description !== undefined)
        updateData.meta_description = shopData.meta_description;
      if (shopData.is_available !== undefined)
        updateData.is_available = shopData.is_available;

      // Upload image baru jika ada
      if (shopData.image) {
        try {
          const fileBase64 = shopData.image.buffer.toString("base64");
          const response = await imagekit.upload({
            fileName: Date.now() + path.extname(shopData.image.originalname),
            file: fileBase64,
            folder: "Ardianzy/shop",
          });
          updateData.image = response.url;
        } catch {
          throw new Error("Failed to upload image");
        }
      }

      return await this.repo.updateById(id, updateData);
    } catch (error) {
      throw new Error(
        `Failed to update Shop: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }
}
