import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, MenuItem } from 'generated/prisma/client';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { RedisService } from 'src/infrastructure/redis/redis.service';
import { CloudinaryService } from 'src/infrastructure/cloudinary/cloudinary.service';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { QueryMenuItemDto, SortOrder } from './dto/query-menu-item.dto';

export interface PaginatedMenuItems {
  data: MenuItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const MENU_ITEMS_CACHE_PREFIX = 'menu-items:';
const MENU_ITEMS_CACHE_TTL = 300; // 5 minutes

@Injectable()
export class MenuItemsService {
  private readonly logger = new Logger(MenuItemsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
    private readonly cloudinaryService: CloudinaryService,
  ) { }

  async findAll(query: QueryMenuItemDto): Promise<PaginatedMenuItems> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 12;
    const skip = (page - 1) * limit;

    // Build cache key from query params
    const cacheKey = `${MENU_ITEMS_CACHE_PREFIX}${JSON.stringify(query)}`;
    const cached = await this.redisService.get<PaginatedMenuItems>(cacheKey);
    if (cached) {
      this.logger.debug('Menu items served from cache');
      return cached;
    }

    // Build where clause
    const where: Prisma.MenuItemWhereInput = {};

    if (query.search) {
      where.name = { contains: query.search, mode: 'insensitive' };
    }

    if (query.category) {
      where.categoryId = query.category;
    }

    if (query.available !== undefined) {
      where.available = query.available === 'true';
    }

    // Build orderBy
    const orderBy = this.buildOrderBy(query.sort);

    const [items, total] = await Promise.all([
      this.prisma.menuItem.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: { category: { select: { id: true, name: true } } },
      }),
      this.prisma.menuItem.count({ where }),
    ]);

    const result: PaginatedMenuItems = {
      data: items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };

    await this.redisService.set(cacheKey, result, {
      ttl: MENU_ITEMS_CACHE_TTL,
    });

    return result;
  }

  async findOne(id: string): Promise<MenuItem> {
    const item = await this.prisma.menuItem.findUnique({
      where: { id },
      include: { category: { select: { id: true, name: true } } },
    });

    if (!item) {
      throw new NotFoundException(`Menu item with ID "${id}" not found`);
    }

    return item;
  }

  async create(
    createMenuItemDto: CreateMenuItemDto,
    imageFile?: Express.Multer.File,
  ): Promise<MenuItem> {
    // Verify category exists
    const category = await this.prisma.category.findUnique({
      where: { id: createMenuItemDto.categoryId },
    });

    if (!category) {
      throw new BadRequestException(
        `Category with ID "${createMenuItemDto.categoryId}" not found`,
      );
    }

    let imageUrl = '';

    if (imageFile) {
      const uploadResult = await this.cloudinaryService.uploadImage(
        imageFile.buffer,
      );
      imageUrl = uploadResult.secureUrl;
    }

    const menuItem = await this.prisma.menuItem.create({
      data: {
        name: createMenuItemDto.name,
        description: createMenuItemDto.description,
        price: createMenuItemDto.price,
        categoryId: createMenuItemDto.categoryId,
        available: createMenuItemDto.available ?? true,
        image: imageUrl,
      },
      include: { category: { select: { id: true, name: true } } },
    });

    await this.invalidateCache();
    return menuItem;
  }

  async update(
    id: string,
    updateMenuItemDto: UpdateMenuItemDto,
    imageFile?: Express.Multer.File,
  ): Promise<MenuItem> {
    const existing = await this.findOne(id);

    if (updateMenuItemDto.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: updateMenuItemDto.categoryId },
      });

      if (!category) {
        throw new BadRequestException(
          `Category with ID "${updateMenuItemDto.categoryId}" not found`,
        );
      }
    }

    let imageUrl: string | undefined;

    if (imageFile) {
      // Delete old image from Cloudinary if it exists
      if (existing.image) {
        const publicId = this.cloudinaryService.extractPublicId(existing.image);
        if (publicId) {
          await this.cloudinaryService.deleteImage(publicId);
        }
      }

      const uploadResult = await this.cloudinaryService.uploadImage(
        imageFile.buffer,
      );
      imageUrl = uploadResult.secureUrl;
    }

    const menuItem = await this.prisma.menuItem.update({
      where: { id },
      data: {
        ...updateMenuItemDto,
        ...(imageUrl ? { image: imageUrl } : {}),
      },
      include: { category: { select: { id: true, name: true } } },
    });

    await this.invalidateCache();
    return menuItem;
  }

  async remove(id: string): Promise<{ message: string }> {
    const item = await this.findOne(id);

    // Delete image from Cloudinary
    if (item.image) {
      const publicId = this.cloudinaryService.extractPublicId(item.image);
      if (publicId) {
        await this.cloudinaryService.deleteImage(publicId);
      }
    }

    await this.prisma.menuItem.delete({ where: { id } });
    await this.invalidateCache();

    return { message: `Menu item "${item.name}" deleted successfully` };
  }

  private buildOrderBy(
    sort?: SortOrder,
  ): Prisma.MenuItemOrderByWithRelationInput {
    switch (sort) {
      case SortOrder.PRICE_ASC:
        return { price: 'asc' };
      case SortOrder.PRICE_DESC:
        return { price: 'desc' };
      case SortOrder.NAME_ASC:
        return { name: 'asc' };
      case SortOrder.NAME_DESC:
        return { name: 'desc' };
      case SortOrder.NEWEST:
        return { createdAt: 'desc' };
      default:
        return { createdAt: 'desc' };
    }
  }

  private async invalidateCache(): Promise<void> {
    await this.redisService.del(`${MENU_ITEMS_CACHE_PREFIX}*`);
  }
}
