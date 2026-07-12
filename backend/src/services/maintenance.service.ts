import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { parsePagination, buildPaginatedResponse } from '../utils/helpers';
import { MaintenanceDTO } from '../dto';
import { PaginationQuery, LifecycleStatus } from '../types';

export class MaintenanceService {
  async list(query: PaginationQuery & { priority?: string; workflowStatus?: string; assignedTo?: string }) {
    const { page, limit, skip, sortBy, sortOrder } = parsePagination(query);

    const where: any = { isDeleted: false };
    if (query.search) {
      where.OR = [
        { title: { contains: query.search } },
        { asset: { name: { contains: query.search } } },
      ];
    }
    if (query.priority) where.priority = query.priority;
    if (query.workflowStatus) where.workflowStatus = query.workflowStatus;
    if (query.assignedTo) where.assignedTo = query.assignedTo;

    const [requests, total] = await Promise.all([
      prisma.maintenanceRequest.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          asset: { select: { id: true, name: true, assetTag: true } },
          requester: { select: { id: true, firstName: true, lastName: true } },
          technician: { select: { id: true, firstName: true, lastName: true } },
        },
      }),
      prisma.maintenanceRequest.count({ where }),
    ]);

    return buildPaginatedResponse(requests, total, page, limit);
  }

  async getById(id: string) {
    const request = await prisma.maintenanceRequest.findUnique({
      where: { id, isDeleted: false },
      include: {
        asset: { select: { id: true, name: true, assetTag: true, category: { select: { name: true } } } },
        requester: { select: { id: true, firstName: true, lastName: true, email: true } },
        technician: { select: { id: true, firstName: true, lastName: true, email: true } },
        history: { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!request) throw new AppError('Maintenance request not found', 404);
    return request;
  }

  async create(data: MaintenanceDTO, requestedBy: string) {
    const asset = await prisma.asset.findUnique({ where: { id: data.assetId } });
    if (!asset) throw new AppError('Asset not found', 404);

    const request = await prisma.maintenanceRequest.create({
      data: {
        ...data,
        requestedBy,
        createdBy: requestedBy,
      },
      include: {
        asset: { select: { id: true, name: true, assetTag: true } },
        requester: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    // Create history
    await prisma.maintenanceHistory.create({
      data: {
        requestId: request.id,
        action: 'CREATED',
        description: 'Maintenance request created',
        performedBy: requestedBy,
        createdBy: requestedBy,
      },
    });

    return request;
  }

  async updateWorkflow(id: string, workflowStatus: string, userId: string, data?: { assignedTo?: string; resolution?: string; cost?: number }) {
    const request = await prisma.maintenanceRequest.findUnique({ where: { id } });
    if (!request) throw new AppError('Request not found', 404);

    const updateData: any = { workflowStatus };
    if (workflowStatus === 'APPROVED') updateData.approvedDate = new Date();
    if (workflowStatus === 'RESOLVED') updateData.resolvedDate = new Date();
    if (data?.assignedTo) updateData.assignedTo = data.assignedTo;
    if (data?.resolution) updateData.resolution = data.resolution;
    if (data?.cost) updateData.cost = data.cost;

    const updated = await prisma.maintenanceRequest.update({
      where: { id },
      data: updateData,
      include: {
        asset: true,
        requester: { select: { id: true, firstName: true, lastName: true } },
        technician: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    // Update asset status
    if (workflowStatus === 'APPROVED' || workflowStatus === 'IN_PROGRESS') {
      await prisma.asset.update({
        where: { id: request.assetId },
        data: { lifecycleStatus: LifecycleStatus.MAINTENANCE },
      });
    }
    if (workflowStatus === 'RESOLVED') {
      await prisma.asset.update({
        where: { id: request.assetId },
        data: { lifecycleStatus: LifecycleStatus.AVAILABLE },
      });
    }

    // History
    await prisma.maintenanceHistory.create({
      data: {
        requestId: id,
        action: 'STATUS_CHANGE',
        description: `Status changed to ${workflowStatus}`,
        oldValue: request.workflowStatus,
        newValue: workflowStatus,
        performedBy: userId,
        createdBy: userId,
      },
    });

    // Notification to requester
    await prisma.notification.create({
      data: {
        userId: request.requestedBy,
        title: `Maintenance ${workflowStatus.toLowerCase().replace('_', ' ')}`,
        message: `Your maintenance request "${request.title}" has been ${workflowStatus.toLowerCase().replace('_', ' ')}.`,
        type: 'MAINTENANCE',
        link: `/maintenance/${id}`,
        createdBy: userId,
      },
    });

    return updated;
  }
}
