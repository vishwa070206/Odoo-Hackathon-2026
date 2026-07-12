import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { parsePagination, buildPaginatedResponse } from '../utils/helpers';
import { PaginationQuery } from '../types';

export class UserService {
  async list(query: PaginationQuery & { departmentId?: string; roleId?: string }) {
    const { page, limit, skip, sortBy, sortOrder } = parsePagination(query);

    const where: any = { isDeleted: false };
    if (query.search) {
      where.OR = [
        { firstName: { contains: query.search } },
        { lastName: { contains: query.search } },
        { email: { contains: query.search } },
        { employeeId: { contains: query.search } },
      ];
    }
    if (query.departmentId) where.departmentId = query.departmentId;
    if (query.roleId) where.roleId = query.roleId;
    if (query.status) where.status = query.status;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: { role: true, department: true },
        omit: { password: true, refreshToken: true, resetPasswordToken: true, emailVerifyToken: true },
      }),
      prisma.user.count({ where }),
    ]);

    return buildPaginatedResponse(users, total, page, limit);
  }

  async getById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id, isDeleted: false },
      include: { role: true, department: true, manager: { select: { id: true, firstName: true, lastName: true } } },
      omit: { password: true, refreshToken: true, resetPasswordToken: true, emailVerifyToken: true },
    });
    if (!user) throw new AppError('User not found', 404);
    return user;
  }

  async update(id: string, data: any) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new AppError('User not found', 404);

    return prisma.user.update({
      where: { id },
      data,
      include: { role: true, department: true },
      omit: { password: true, refreshToken: true, resetPasswordToken: true, emailVerifyToken: true },
    });
  }

  async promote(userId: string, roleId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError('User not found', 404);

    const role = await prisma.role.findUnique({ where: { id: roleId } });
    if (!role) throw new AppError('Role not found', 404);

    return prisma.user.update({
      where: { id: userId },
      data: { roleId },
      include: { role: true, department: true },
      omit: { password: true, refreshToken: true, resetPasswordToken: true, emailVerifyToken: true },
    });
  }

  async deactivate(userId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { status: 'INACTIVE' },
    });
  }

  async activate(userId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { status: 'ACTIVE' },
    });
  }

  async getRoles() {
    return prisma.role.findMany();
  }
}
