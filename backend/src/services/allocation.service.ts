import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { parsePagination, buildPaginatedResponse } from '../utils/helpers';
import { AllocationDTO, ReturnDTO, TransferDTO } from '../dto';
import { PaginationQuery, LifecycleStatus } from '../types';

export class AllocationService {
  async list(query: PaginationQuery & { employeeId?: string; assetId?: string; allocationStatus?: string }) {
    const { page, limit, skip, sortBy, sortOrder } = parsePagination(query);

    const where: any = { isDeleted: false };
    if (query.search) {
      where.OR = [
        { asset: { name: { contains: query.search } } },
        { asset: { assetTag: { contains: query.search } } },
        { employee: { firstName: { contains: query.search } } },
      ];
    }
    if (query.employeeId) where.employeeId = query.employeeId;
    if (query.assetId) where.assetId = query.assetId;
    if (query.allocationStatus) where.allocationStatus = query.allocationStatus;

    const [allocations, total] = await Promise.all([
      prisma.allocation.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          asset: { select: { id: true, name: true, assetTag: true, lifecycleStatus: true } },
          employee: { select: { id: true, firstName: true, lastName: true, email: true, employeeId: true } },
          department: { select: { id: true, name: true } },
        },
      }),
      prisma.allocation.count({ where }),
    ]);

    return buildPaginatedResponse(allocations, total, page, limit);
  }

  async allocate(data: AllocationDTO, createdBy: string) {
    // Check asset availability
    const asset = await prisma.asset.findUnique({ where: { id: data.assetId } });
    if (!asset) throw new AppError('Asset not found', 404);
    if (asset.lifecycleStatus !== LifecycleStatus.AVAILABLE) {
      throw new AppError('Asset is not available for allocation', 400);
    }

    // Check no active allocation for this asset
    const activeAllocation = await prisma.allocation.findFirst({
      where: { assetId: data.assetId, allocationStatus: 'ACTIVE' },
    });
    if (activeAllocation) throw new AppError('Asset is already allocated', 400);

    const allocation = await prisma.allocation.create({
      data: {
        ...data,
        expectedReturnDate: data.expectedReturnDate ? new Date(data.expectedReturnDate) : null,
        createdBy,
      },
      include: {
        asset: true,
        employee: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });

    // Update asset status
    await prisma.asset.update({
      where: { id: data.assetId },
      data: { lifecycleStatus: LifecycleStatus.ALLOCATED },
    });

    // Create history
    await prisma.assetHistory.create({
      data: {
        assetId: data.assetId,
        action: 'ALLOCATED',
        description: `Allocated to ${allocation.employee.firstName} ${allocation.employee.lastName}`,
        performedBy: createdBy,
        createdBy,
      },
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId: data.employeeId,
        title: 'Asset Assigned',
        message: `Asset "${asset.name}" (${asset.assetTag}) has been assigned to you.`,
        type: 'ALLOCATION',
        link: `/assets/${asset.id}`,
        createdBy,
      },
    });

    return allocation;
  }

  async returnAsset(data: ReturnDTO, processedBy: string) {
    const allocation = await prisma.allocation.findUnique({
      where: { id: data.allocationId },
      include: { asset: true },
    });
    if (!allocation) throw new AppError('Allocation not found', 404);
    if (allocation.allocationStatus !== 'ACTIVE' && allocation.allocationStatus !== 'OVERDUE') {
      throw new AppError('Allocation is not active', 400);
    }

    // Create return record
    const returnRecord = await prisma.return.create({
      data: {
        allocationId: data.allocationId,
        condition: data.condition,
        notes: data.notes,
        processedBy,
        createdBy: processedBy,
      },
    });

    // Update allocation
    await prisma.allocation.update({
      where: { id: data.allocationId },
      data: {
        allocationStatus: 'RETURNED',
        actualReturnDate: new Date(),
      },
    });

    // Update asset status back to available
    await prisma.asset.update({
      where: { id: allocation.assetId },
      data: {
        lifecycleStatus: LifecycleStatus.AVAILABLE,
        condition: data.condition === 'DAMAGED' ? 'POOR' : data.condition === 'POOR' ? 'POOR' : data.condition === 'FAIR' ? 'FAIR' : 'GOOD',
      },
    });

    // History
    await prisma.assetHistory.create({
      data: {
        assetId: allocation.assetId,
        action: 'RETURNED',
        description: `Returned in ${data.condition} condition`,
        performedBy: processedBy,
        createdBy: processedBy,
      },
    });

    return returnRecord;
  }

  async getOverdue() {
    const overdueAllocations = await prisma.allocation.findMany({
      where: {
        allocationStatus: 'ACTIVE',
        expectedReturnDate: { lt: new Date() },
        isDeleted: false,
      },
      include: {
        asset: { select: { id: true, name: true, assetTag: true } },
        employee: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });

    // Update status to overdue
    for (const alloc of overdueAllocations) {
      await prisma.allocation.update({
        where: { id: alloc.id },
        data: { allocationStatus: 'OVERDUE' },
      });
    }

    return overdueAllocations;
  }
}

export class TransferService {
  async list(query: PaginationQuery & { transferStatus?: string }) {
    const { page, limit, skip, sortBy, sortOrder } = parsePagination(query);

    const where: any = { isDeleted: false };
    if (query.transferStatus) where.transferStatus = query.transferStatus;
    if (query.search) {
      where.asset = { name: { contains: query.search } };
    }

    const [transfers, total] = await Promise.all([
      prisma.transfer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          asset: { select: { id: true, name: true, assetTag: true } },
          requester: { select: { id: true, firstName: true, lastName: true } },
          approver: { select: { id: true, firstName: true, lastName: true } },
        },
      }),
      prisma.transfer.count({ where }),
    ]);

    return buildPaginatedResponse(transfers, total, page, limit);
  }

  async create(data: TransferDTO, requestedBy: string) {
    const asset = await prisma.asset.findUnique({ where: { id: data.assetId } });
    if (!asset) throw new AppError('Asset not found', 404);

    return prisma.transfer.create({
      data: {
        assetId: data.assetId,
        allocationId: data.allocationId,
        toDepartmentId: data.toDepartmentId,
        toUserId: data.toUserId,
        fromDepartmentId: asset.departmentId,
        requestedBy,
        reason: data.reason,
        createdBy: requestedBy,
      },
      include: {
        asset: true,
        requester: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async approve(id: string, approvedBy: string) {
    const transfer = await prisma.transfer.findUnique({ where: { id } });
    if (!transfer) throw new AppError('Transfer not found', 404);
    if (transfer.transferStatus !== 'PENDING' && transfer.transferStatus !== 'DEPT_HEAD_APPROVED') {
      throw new AppError('Transfer cannot be approved in current status', 400);
    }

    const newStatus = transfer.transferStatus === 'PENDING' ? 'DEPT_HEAD_APPROVED' : 'APPROVED';

    return prisma.transfer.update({
      where: { id },
      data: {
        transferStatus: newStatus,
        approvedBy,
        approvedDate: new Date(),
      },
    });
  }

  async reject(id: string, approvedBy: string) {
    return prisma.transfer.update({
      where: { id },
      data: { transferStatus: 'REJECTED', approvedBy },
    });
  }

  async complete(id: string) {
    const transfer = await prisma.transfer.findUnique({ where: { id } });
    if (!transfer) throw new AppError('Transfer not found', 404);
    if (transfer.transferStatus !== 'APPROVED') {
      throw new AppError('Transfer must be approved first', 400);
    }

    // Update asset department
    if (transfer.toDepartmentId) {
      await prisma.asset.update({
        where: { id: transfer.assetId },
        data: { departmentId: transfer.toDepartmentId },
      });
    }

    // If there's a current allocation, mark it as transferred
    if (transfer.allocationId) {
      await prisma.allocation.update({
        where: { id: transfer.allocationId },
        data: { allocationStatus: 'TRANSFERRED' },
      });
    }

    return prisma.transfer.update({
      where: { id },
      data: {
        transferStatus: 'COMPLETED',
        completedDate: new Date(),
      },
    });
  }
}
