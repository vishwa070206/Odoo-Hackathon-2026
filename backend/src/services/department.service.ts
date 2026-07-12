import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { parsePagination, buildPaginatedResponse } from '../utils/helpers';
import { DepartmentDTO } from '../dto';
import { PaginationQuery } from '../types';

export class DepartmentService {
  async list(query: PaginationQuery) {
    const { page, limit, skip, sortBy, sortOrder } = parsePagination(query);

    const where: any = { isDeleted: false };
    if (query.search) {
      where.OR = [
        { name: { contains: query.search } },
        { code: { contains: query.search } },
      ];
    }
    if (query.status) where.status = query.status;

    const [departments, total] = await Promise.all([
      prisma.department.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          head: { select: { id: true, firstName: true, lastName: true, email: true } },
          parent: { select: { id: true, name: true } },
          _count: { select: { members: true, assets: true, children: true } },
        },
      }),
      prisma.department.count({ where }),
    ]);

    return buildPaginatedResponse(departments, total, page, limit);
  }

  async getById(id: string) {
    const department = await prisma.department.findUnique({
      where: { id, isDeleted: false },
      include: {
        head: { select: { id: true, firstName: true, lastName: true, email: true } },
        parent: { select: { id: true, name: true } },
        children: { select: { id: true, name: true, code: true } },
        _count: { select: { members: true, assets: true } },
      },
    });
    if (!department) throw new AppError('Department not found', 404);
    return department;
  }

  async create(data: DepartmentDTO, createdBy: string) {
    const existing = await prisma.department.findFirst({
      where: { OR: [{ name: data.name }, { code: data.code }], isDeleted: false },
    });
    if (existing) throw new AppError('Department with this name or code already exists', 400);

    return prisma.department.create({
      data: { ...data, createdBy },
      include: {
        head: { select: { id: true, firstName: true, lastName: true } },
        parent: { select: { id: true, name: true } },
      },
    });
  }

  async update(id: string, data: Partial<DepartmentDTO>) {
    const dept = await prisma.department.findUnique({ where: { id } });
    if (!dept) throw new AppError('Department not found', 404);

    return prisma.department.update({
      where: { id },
      data,
      include: {
        head: { select: { id: true, firstName: true, lastName: true } },
        parent: { select: { id: true, name: true } },
      },
    });
  }

  async deactivate(id: string) {
    return prisma.department.update({
      where: { id },
      data: { status: 'INACTIVE' },
    });
  }

  async getHierarchy() {
    const departments = await prisma.department.findMany({
      where: { isDeleted: false, parentId: null },
      include: {
        children: {
          include: {
            children: { include: { children: true } },
          },
        },
        head: { select: { id: true, firstName: true, lastName: true } },
        _count: { select: { members: true } },
      },
    });
    return departments;
  }
}
