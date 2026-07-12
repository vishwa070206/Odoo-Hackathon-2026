import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { parsePagination, buildPaginatedResponse } from '../utils/helpers';
import { CategoryDTO } from '../dto';
import { PaginationQuery } from '../types';

export class CategoryService {
  async list(query: PaginationQuery) {
    const { page, limit, skip, sortBy, sortOrder } = parsePagination(query);

    const where: any = { isDeleted: false };
    if (query.search) {
      where.name = { contains: query.search };
    }
    if (query.status) where.status = query.status;

    const [categories, total] = await Promise.all([
      prisma.assetCategory.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          parent: { select: { id: true, name: true } },
          _count: { select: { assets: true, children: true } },
        },
      }),
      prisma.assetCategory.count({ where }),
    ]);

    return buildPaginatedResponse(categories, total, page, limit);
  }

  async getById(id: string) {
    const category = await prisma.assetCategory.findUnique({
      where: { id, isDeleted: false },
      include: {
        parent: { select: { id: true, name: true } },
        children: { select: { id: true, name: true } },
        _count: { select: { assets: true } },
      },
    });
    if (!category) throw new AppError('Category not found', 404);
    return category;
  }

  async create(data: CategoryDTO, createdBy: string) {
    const existing = await prisma.assetCategory.findUnique({ where: { name: data.name } });
    if (existing) throw new AppError('Category already exists', 400);

    return prisma.assetCategory.create({
      data: { ...data, customFields: data.customFields || undefined, createdBy },
    });
  }

  async update(id: string, data: Partial<CategoryDTO>) {
    const cat = await prisma.assetCategory.findUnique({ where: { id } });
    if (!cat) throw new AppError('Category not found', 404);

    return prisma.assetCategory.update({
      where: { id },
      data: { ...data, customFields: data.customFields || undefined },
    });
  }

  async delete(id: string) {
    const assetsCount = await prisma.asset.count({ where: { categoryId: id, isDeleted: false } });
    if (assetsCount > 0) throw new AppError('Cannot delete category with existing assets', 400);

    return prisma.assetCategory.update({
      where: { id },
      data: { isDeleted: true },
    });
  }
}
