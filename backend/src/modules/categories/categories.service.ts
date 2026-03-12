import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { RedisService } from 'src/infrastructure/redis/redis.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from 'generated/prisma/client';

const CATEGORIES_CACHE_KEY = 'categories:all';
const CATEGORIES_CACHE_TTL = 300; // 5 minutes

@Injectable()
export class CategoriesService {
  private readonly logger = new Logger(CategoriesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
  ) { }

  async findAll(): Promise<Category[]> {
    const cached = await this.redisService.get<Category[]>(CATEGORIES_CACHE_KEY);
    if (cached) {
      this.logger.debug('Categories served from cache');
      return cached;
    }

    const categories = await this.prisma.category.findMany({
      orderBy: { createdAt: 'asc' },
      include: { _count: { select: { items: true } } },
    });

    await this.redisService.set(CATEGORIES_CACHE_KEY, categories, {
      ttl: CATEGORIES_CACHE_TTL,
    });

    return categories;
  }

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const existing = await this.prisma.category.findUnique({
      where: { name: createCategoryDto.name },
    });

    if (existing) {
      throw new ConflictException(
        `Category "${createCategoryDto.name}" already exists`,
      );
    }

    const category = await this.prisma.category.create({
      data: { name: createCategoryDto.name },
    });

    await this.invalidateCache();
    return category;
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    await this.findOneOrThrow(id);

    if (updateCategoryDto.name) {
      const existing = await this.prisma.category.findFirst({
        where: {
          name: updateCategoryDto.name,
          id: { not: id },
        },
      });

      if (existing) {
        throw new ConflictException(
          `Category "${updateCategoryDto.name}" already exists`,
        );
      }
    }

    const category = await this.prisma.category.update({
      where: { id },
      data: updateCategoryDto,
    });

    await this.invalidateCache();
    return category;
  }

  async remove(id: string): Promise<{ message: string }> {
    const category = await this.findOneOrThrow(id);

    const itemCount = await this.prisma.menuItem.count({
      where: { categoryId: id },
    });

    if (itemCount > 0) {
      throw new ConflictException(
        `Cannot delete category "${category.name}" — it has ${itemCount} menu item(s). Remove or reassign them first.`,
      );
    }

    await this.prisma.category.delete({ where: { id } });
    await this.invalidateCache();

    return { message: `Category "${category.name}" deleted successfully` };
  }

  private async findOneOrThrow(id: string): Promise<Category> {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) {
      throw new NotFoundException(`Category with ID "${id}" not found`);
    }
    return category;
  }

  private async invalidateCache(): Promise<void> {
    await this.redisService.del(CATEGORIES_CACHE_KEY);
    // Also invalidate menu items cache since they include category data
    await this.redisService.del('menu-items:*');
  }
}
