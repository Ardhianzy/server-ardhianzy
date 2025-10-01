import prisma from "../config/db";

export type ModelType =
  | "research"
  | "article"
  | "shop"
  | "tot"
  | "glosarium"
  | "collected_meditations";

export interface SEOMetaResult {
  metaTitle: string;
  metaDescription: string;
}

export interface SlugValidationResult {
  isValid: boolean;
  errors: string[];
}

abstract class BaseSlugManager {
  protected readonly MIN_SLUG_LENGTH = 3;
  protected readonly MAX_SLUG_LENGTH = 100;

  protected generateBasicSlug(text: string): string {
    return (
      text
        .toLowerCase()
        .trim()
        // Replace Indonesian characters
        .replace(/[àáäâ]/g, "a")
        .replace(/[èéëê]/g, "e")
        .replace(/[ìíïî]/g, "i")
        .replace(/[òóöô]/g, "o")
        .replace(/[ùúüû]/g, "u")
        .replace(/[ñ]/g, "n")
        .replace(/[ç]/g, "c")
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/[\s-]+/g, "-")
        .replace(/^-+|-+$/g, "")
    );
  }

  public validateSlug(slug: string): SlugValidationResult {
    const errors: string[] = [];
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

    if (!slugRegex.test(slug)) {
      errors.push(
        "Slug must contain only lowercase letters, numbers, and hyphens"
      );
    }

    if (slug.length < this.MIN_SLUG_LENGTH) {
      errors.push(
        `Slug must be at least ${this.MIN_SLUG_LENGTH} characters long`
      );
    }

    if (slug.length > this.MAX_SLUG_LENGTH) {
      errors.push(`Slug must not exceed ${this.MAX_SLUG_LENGTH} characters`);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

class DatabaseSlugChecker {
  async checkSlugExists(
    slug: string,
    model: ModelType,
    excludeId?: string // <--- PERUBAHAN 1
  ): Promise<boolean> {
    const where: any = { slug };

    if (excludeId) {
      where.id = { not: excludeId };
    }

    const modelMap = {
      research: () => prisma.research.findFirst({ where }),
      article: () => prisma.article.findFirst({ where }),
      shop: () => prisma.shop.findFirst({ where }),
      tot: () => prisma.toT.findFirst({ where }),
      glosarium: () => prisma.glosarium.findFirst({ where }),
      collected_meditations: () =>
        prisma.collected_meditations.findFirst({ where }),
    };

    try {
      const existing = await modelMap[model]();
      return !!existing;
    } catch (error) {
      console.error(`Error checking slug existence for model ${model}:`, error);
      return false;
    }
  }
}

export class SlugGenerator extends BaseSlugManager {
  private dbChecker: DatabaseSlugChecker;

  constructor() {
    super();
    this.dbChecker = new DatabaseSlugChecker();
  }

  public generateSlug(text: string): string {
    return this.generateBasicSlug(text);
  }

  public async generateUniqueSlug(
    baseText: string,
    model: ModelType,
    excludeId?: string // <--- PERUBAHAN 2
  ): Promise<string> {
    const baseSlug = this.generateBasicSlug(baseText);
    let slug = baseSlug;
    let counter = 1;

    while (await this.dbChecker.checkSlugExists(slug, model, excludeId)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }

  public async generateValidatedUniqueSlug(
    baseText: string,
    model: ModelType,
    excludeId?: string // <--- PERUBAHAN 3
  ): Promise<{ slug: string; validation: SlugValidationResult }> {
    const slug = await this.generateUniqueSlug(baseText, model, excludeId);
    const validation = this.validateSlug(slug);

    return { slug, validation };
  }
}

export class SEOMetaGenerator {
  private readonly MAX_TITLE_LENGTH = 60;
  private readonly MAX_DESCRIPTION_LENGTH = 155;

  public generateSEOMeta(title: string, content?: string): SEOMetaResult {
    const metaTitle = this.generateMetaTitle(title);
    const metaDescription = this.generateMetaDescription(content);

    return {
      metaTitle,
      metaDescription,
    };
  }

  private generateMetaTitle(title: string): string {
    if (title.length <= this.MAX_TITLE_LENGTH) {
      return title;
    }

    return title.substring(0, this.MAX_TITLE_LENGTH - 3) + "...";
  }

  private generateMetaDescription(content?: string): string {
    if (!content) {
      return "";
    }

    const plainText = this.stripHtmlTags(content);

    if (plainText.length <= this.MAX_DESCRIPTION_LENGTH) {
      return plainText;
    }

    return plainText.substring(0, this.MAX_DESCRIPTION_LENGTH - 3) + "...";
  }

  private stripHtmlTags(content: string): string {
    return content
      .replace(/<[^>]*>/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  public generateCustomLengthDescription(
    content: string,
    maxLength: number = this.MAX_DESCRIPTION_LENGTH
  ): string {
    const plainText = this.stripHtmlTags(content);

    if (plainText.length <= maxLength) {
      return plainText;
    }

    return plainText.substring(0, maxLength - 3) + "...";
  }
}

export class UtilityFactory {
  private static slugGenerator: SlugGenerator;
  private static seoGenerator: SEOMetaGenerator;

  public static getSlugGenerator(): SlugGenerator {
    if (!this.slugGenerator) {
      this.slugGenerator = new SlugGenerator();
    }
    return this.slugGenerator;
  }

  public static getSEOGenerator(): SEOMetaGenerator {
    if (!this.seoGenerator) {
      this.seoGenerator = new SEOMetaGenerator();
    }
    return this.seoGenerator;
  }

  public static createSlugGenerator(): SlugGenerator {
    return new SlugGenerator();
  }

  public static createSEOGenerator(): SEOMetaGenerator {
    return new SEOMetaGenerator();
  }
}

export const generateSlug = (text: string): string => {
  return UtilityFactory.getSlugGenerator().generateSlug(text);
};

export const generateUniqueSlug = async (
  baseText: string,
  model: ModelType,
  excludeId?: string // <--- PERUBAHAN 4
): Promise<string> => {
  return UtilityFactory.getSlugGenerator().generateUniqueSlug(
    baseText,
    model,
    excludeId
  );
};

export const isValidSlug = (slug: string): boolean => {
  return UtilityFactory.getSlugGenerator().validateSlug(slug).isValid;
};

export const generateSEOMeta = (
  title: string,
  content?: string
): SEOMetaResult => {
  return UtilityFactory.getSEOGenerator().generateSEOMeta(title, content);
};
