import prisma from '../config/database';
import { parsePagination, buildPaginatedResponse } from '../utils/helpers';
import { PaginationQuery } from '../types';

export class NotificationService {
  async list(userId: string, query: PaginationQuery & { isRead?: string }) {
    const { page, limit, skip } = parsePagination(query);

    const where: any = { userId, isDeleted: false };
    if (query.isRead === 'true') where.isRead = true;
    if (query.isRead === 'false') where.isRead = false;

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.notification.count({ where }),
    ]);

    return buildPaginatedResponse(notifications, total, page, limit);
  }

  async getUnreadCount(userId: string) {
    return prisma.notification.count({
      where: { userId, isRead: false, isDeleted: false },
    });
  }

  async markAsRead(id: string, userId: string) {
    return prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  async create(userId: string, title: string, message: string, type: string, link?: string, createdBy?: string) {
    return prisma.notification.create({
      data: { userId, title, message, type, link, createdBy },
    });
  }
}

export class ActivityLogService {
  async list(query: PaginationQuery & { entity?: string; action?: string; userId?: string }) {
    const { page, limit, skip } = parsePagination(query);

    const where: any = { isDeleted: false };
    if (query.entity) where.entity = query.entity;
    if (query.action) where.action = query.action;
    if (query.userId) where.userId = query.userId;
    if (query.search) {
      where.OR = [
        { description: { contains: query.search } },
        { entity: { contains: query.search } },
      ];
    }

    const [logs, total] = await Promise.all([
      prisma.activityLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
      }),
      prisma.activityLog.count({ where }),
    ]);

    return buildPaginatedResponse(logs, total, page, limit);
  }

  async log(data: {
    userId?: string; action: string; entity: string; entityId?: string;
    description?: string; oldValue?: string; newValue?: string;
    ipAddress?: string; userAgent?: string;
  }) {
    return prisma.activityLog.create({ data });
  }
}

export class ReportService {
  async getAssetUtilization() {
    const assets = await prisma.asset.groupBy({
      by: ['lifecycleStatus'],
      where: { isDeleted: false },
      _count: true,
    });
    return assets;
  }

  async getDepartmentAllocation() {
    const departments = await prisma.department.findMany({
      where: { isDeleted: false },
      select: {
        id: true,
        name: true,
        _count: { select: { assets: true, members: true } },
      },
    });
    return departments;
  }

  async getMaintenanceCost() {
    const costs = await prisma.maintenanceRequest.groupBy({
      by: ['priority'],
      where: { isDeleted: false, workflowStatus: 'RESOLVED' },
      _sum: { cost: true },
      _count: true,
    });
    return costs;
  }

  async getBookingHeatmap(startDate: string, endDate: string) {
    const bookings = await prisma.booking.findMany({
      where: {
        isDeleted: false,
        startTime: { gte: new Date(startDate) },
        endTime: { lte: new Date(endDate) },
      },
      select: { startTime: true, endTime: true, assetId: true },
    });

    // Group by day of week and hour
    const heatmap: Record<string, number> = {};
    bookings.forEach((b) => {
      const day = b.startTime.getDay();
      const hour = b.startTime.getHours();
      const key = `${day}-${hour}`;
      heatmap[key] = (heatmap[key] || 0) + 1;
    });

    return heatmap;
  }

  async getAuditSummary() {
    const [totalCycles, openCycles, totalDiscrepancies, resolvedDiscrepancies] = await Promise.all([
      prisma.auditCycle.count({ where: { isDeleted: false } }),
      prisma.auditCycle.count({ where: { isDeleted: false, cycleStatus: { in: ['OPEN', 'IN_PROGRESS'] } } }),
      prisma.discrepancyReport.count({ where: { isDeleted: false } }),
      prisma.discrepancyReport.count({ where: { isDeleted: false, isResolved: true } }),
    ]);

    return { totalCycles, openCycles, totalDiscrepancies, resolvedDiscrepancies };
  }

  async getDashboardKPIs() {
    const [
      totalAssets, availableAssets, allocatedAssets, maintenanceToday,
      activeBookings, pendingTransfers, overdueReturns, recentActivity,
    ] = await Promise.all([
      prisma.asset.count({ where: { isDeleted: false } }),
      prisma.asset.count({ where: { isDeleted: false, lifecycleStatus: 'AVAILABLE' } }),
      prisma.asset.count({ where: { isDeleted: false, lifecycleStatus: 'ALLOCATED' } }),
      prisma.maintenanceRequest.count({
        where: {
          isDeleted: false,
          workflowStatus: { in: ['IN_PROGRESS', 'ASSIGNED'] },
          createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        },
      }),
      prisma.booking.count({
        where: { isDeleted: false, bookingStatus: { in: ['UPCOMING', 'ONGOING'] } },
      }),
      prisma.transfer.count({
        where: { isDeleted: false, transferStatus: 'PENDING' },
      }),
      prisma.allocation.count({
        where: {
          isDeleted: false,
          allocationStatus: 'ACTIVE',
          expectedReturnDate: { lt: new Date() },
        },
      }),
      prisma.activityLog.findMany({
        where: { isDeleted: false },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { user: { select: { firstName: true, lastName: true } } },
      }),
    ]);

    return {
      totalAssets, availableAssets, allocatedAssets, maintenanceToday,
      activeBookings, pendingTransfers, overdueReturns, recentActivity,
    };
  }

  async getUpcomingReturns() {
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    return prisma.allocation.findMany({
      where: {
        isDeleted: false,
        allocationStatus: 'ACTIVE',
        expectedReturnDate: { lte: sevenDaysFromNow, gte: new Date() },
      },
      include: {
        asset: { select: { id: true, name: true, assetTag: true } },
        employee: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { expectedReturnDate: 'asc' },
    });
  }
}
