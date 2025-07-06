import { Shop } from "@prisma/client";
import {
  ShopRepository,
  CreateShopData as RepoCreateShopData,
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

// Interface untuk Create Shop
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
  admin_id: number;
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
   * @param shopData - Data untuk membuat Shop baru
   * @returns Promise<Shop> - Record Shop yang baru dibuat
   */
  async create(shopData: CreateShopData): Promise<Shop> {
    try {
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
        } catch (error) {
          throw new Error("Failed to upload image");
        }
      }

      return this.repo.create({
        admin_id: shopData.admin_id,
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
   * @param title - Title dari Shop yang ingin diambil
   * @returns Promise<Shop | null> - Record Shop atau null jika tidak ditemukan
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
   * @param paginationParams - Parameters untuk pagination
   * @returns Promise<PaginatedResult<Shop>> - Data dengan informasi pagination
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
   * Delete Shop by ID
   * @param id - ID dari Shop yang akan dihapus
   * @returns Promise<Shop> - Record Shop yang telah dihapus
   */
  async deleteById(id: number): Promise<Shop> {
    try {
      return await this.repo.deleteById(id);
    } catch (error) {
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
   * @param shopData - Data yang akan diupdate
   * @returns Promise<Shop> - Record Shop yang telah diupdate
   */

  async updateById(id: number, shopData: UpdateShopData): Promise<Shop> {
    try {
      let updateData: RepoUpdateShopData = {};

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
        } catch (error) {
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
