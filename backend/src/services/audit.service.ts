import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { parsePagination, buildPaginatedResponse } from '../utils/helpers';
import { AuditCycleDTO } from '../dto';
import { PaginationQuery, LifecycleStatus } from '../types';

export class AuditService {
  async listCycles(query: PaginationQuery & { cycleStatus?: string }) {
    const { page, limit, skip, sortBy, sortOrder } = parsePagination(query);

    const where: any = { isDeleted: false };
    if (query.cycleStatus) where.cycleStatus = query.cycleStatus;
    if (query.search) where.name = { contains: query.search };

    const [cycles, total] = await Promise.all([
      prisma.auditCycle.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          department: { select: { id: true, name: true } },
          creator: { select: { id: true, firstName: true, lastName: true } },
          _count: { select: { assignments: true, discrepancies: true } },
        },
      }),
      prisma.auditCycle.count({ where }),
    ]);

    return buildPaginatedResponse(cycles, total, page, limit);
  }

  async getCycleById(id: string) {
    const cycle = await prisma.auditCycle.findUnique({
      where: { id, isDeleted: false },
      include: {
        department: true,
        creator: { select: { id: true, firstName: true, lastName: true } },
        assignments: {
          include: {
            auditor: { select: { id: true, firstName: true, lastName: true } },
            items: {
              include: { asset: { select: { id: true, name: true, assetTag: true, location: true } } },
            },
          },
        },
        discrepancies: {
          include: { asset: { select: { id: true, name: true, assetTag: true } } },
        },
      },
    });
    if (!cycle) throw new AppError('Audit cycle not found', 404);
    return cycle;
  }

  async createCycle(data: AuditCycleDTO, createdBy: string) {
    return prisma.auditCycle.create({
      data: {
        name: data.name,
        description: data.description,
        departmentId: data.departmentId,
        location: data.location,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        createdBy,
      },
    });
  }

  async assignAuditor(cycleId: string, auditorId: string, scope: string, createdBy: string) {
    const cycle = await prisma.auditCycle.findUnique({ where: { id: cycleId } });
    if (!cycle) throw new AppError('Audit cycle not found', 404);
    if (cycle.isLocked) throw new AppError('Audit cycle is locked', 400);

    const assignment = await prisma.auditAssignment.create({
      data: { cycleId, auditorId, scope, createdBy },
    });

    // Auto-populate items from assets in scope
    const assetWhere: any = { isDeleted: false };
    if (cycle.departmentId) assetWhere.departmentId = cycle.departmentId;
    if (cycle.location) assetWhere.location = { contains: cycle.location };

    const assets = await prisma.asset.findMany({ where: assetWhere, select: { id: true } });

    if (assets.length > 0) {
      await prisma.auditItem.createMany({
        data: assets.map((a) => ({
          assignmentId: assignment.id,
          assetId: a.id,
          createdBy,
        })),
      });
    }

    // Notification
    await prisma.notification.create({
      data: {
        userId: auditorId,
        title: 'Audit Assignment',
        message: `You have been assigned to audit cycle "${cycle.name}".`,
        type: 'AUDIT',
        link: `/audits/${cycleId}`,
        createdBy,
      },
    });

    return assignment;
  }

  async verifyItem(itemId: string, verificationStatus: string, notes: string | undefined, userId: string) {
    const item = await prisma.auditItem.findUnique({
      where: { id: itemId },
      include: { assignment: { include: { cycle: true } } },
    });
    if (!item) throw new AppError('Audit item not found', 404);
    if (item.assignment.cycle.isLocked) throw new AppError('Audit cycle is locked', 400);

    const updated = await prisma.auditItem.update({
      where: { id: itemId },
      data: { verificationStatus, notes, verifiedAt: new Date() },
    });

    // If missing, update asset status and create discrepancy
    if (verificationStatus === 'MISSING') {
      await prisma.asset.update({
        where: { id: item.assetId },
        data: { lifecycleStatus: LifecycleStatus.LOST },
      });

      await prisma.discrepancyReport.create({
        data: {
          cycleId: item.assignment.cycleId,
          assetId: item.assetId,
          type: 'MISSING',
          description: notes || 'Asset not found during audit',
          severity: 'HIGH',
          createdBy: userId,
        },
      });
    }

    if (verificationStatus === 'DAMAGED') {
      await prisma.discrepancyReport.create({
        data: {
          cycleId: item.assignment.cycleId,
          assetId: item.assetId,
          type: 'DAMAGED',
          description: notes || 'Asset found damaged during audit',
          severity: 'MEDIUM',
          createdBy: userId,
        },
      });
    }

    return updated;
  }

  async closeCycle(cycleId: string) {
    const cycle = await prisma.auditCycle.findUnique({ where: { id: cycleId } });
    if (!cycle) throw new AppError('Audit cycle not found', 404);

    return prisma.auditCycle.update({
      where: { id: cycleId },
      data: { cycleStatus: 'CLOSED', isLocked: true },
    });
  }
}
