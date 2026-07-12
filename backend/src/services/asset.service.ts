import prisma from '../config/database';
import QRCode from 'qrcode';
import { AppError } from '../middleware/errorHandler';
import { parsePagination, buildPaginatedResponse, generateAssetTag } from '../utils/helpers';
import { AssetDTO } from '../dto';
import { PaginationQuery, LifecycleStatus } from '../types';

export class AssetService {
  async list(query: PaginationQuery & {
    categoryId?: string; departmentId?: string; lifecycleStatus?: string;
    location?: string; isBookable?: string; condition?: string;
  }) {
    const { page, limit, skip, sortBy, sortOrder } = parsePagination(query);

    const where: any = { isDeleted: false };
    if (query.search) {
      where.OR = [
        { name: { contains: query.search } },
        { assetTag: { contains: query.search } },
        { serialNumber: { contains: query.search } },
        { location: { contains: query.search } },
        { brand: { contains: query.search } },
      ];
    }
    if (query.categoryId) where.categoryId = query.categoryId;
    if (query.departmentId) where.departmentId = query.departmentId;
    if (query.lifecycleStatus) where.lifecycleStatus = query.lifecycleStatus;
    if (query.location) where.location = { contains: query.location };
    if (query.isBookable === 'true') where.isBookable = true;
    if (query.condition) where.condition = query.condition;

    const [assets, total] = await Promise.all([
      prisma.asset.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          category: { select: { id: true, name: true, icon: true } },
          department: { select: { id: true, name: true } },
          photos: { where: { isPrimary: true }, take: 1 },
          _count: { select: { allocations: true, maintenanceRequests: true } },
        },
      }),
      prisma.asset.count({ where }),
    ]);

    return buildPaginatedResponse(assets, total, page, limit);
  }

  async getById(id: string) {
    const asset = await prisma.asset.findUnique({
      where: { id, isDeleted: false },
      include: {
        category: true,
        department: true,
        photos: { where: { isDeleted: false } },
        documents: { where: { isDeleted: false } },
        history: { orderBy: { createdAt: 'desc' }, take: 20 },
        allocations: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            employee: { select: { id: true, firstName: true, lastName: true, email: true } },
          },
        },
        maintenanceRequests: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        creator: { select: { id: true, firstName: true, lastName: true } },
      },
    });
    if (!asset) throw new AppError('Asset not found', 404);
    return asset;
  }

  async create(data: AssetDTO, createdBy: string) {
    // Check unique serial number
    if (data.serialNumber) {
      const existingSN = await prisma.asset.findUnique({ where: { serialNumber: data.serialNumber } });
      if (existingSN) throw new AppError('Serial number already exists', 400);
    }

    // Generate asset tag
    const lastAsset = await prisma.asset.findFirst({
      orderBy: { assetTag: 'desc' },
    });
    const assetTag = generateAssetTag(lastAsset?.assetTag || undefined);

    // Generate QR Code
    const qrCode = await QRCode.toDataURL(assetTag, { width: 300, margin: 2 });

    const asset = await prisma.asset.create({
      data: {
        ...data,
        assetTag,
        qrCode,
        purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : null,
        warrantyExpiry: data.warrantyExpiry ? new Date(data.warrantyExpiry) : null,
        acquisitionCost: data.acquisitionCost || null,
        createdBy,
      },
      include: { category: true, department: true },
    });

    // Create history entry
    await prisma.assetHistory.create({
      data: {
        assetId: asset.id,
        action: 'CREATED',
        description: `Asset "${asset.name}" registered with tag ${assetTag}`,
        performedBy: createdBy,
        createdBy,
      },
    });

    return asset;
  }

  async update(id: string, data: Partial<AssetDTO>, updatedBy: string) {
    const asset = await prisma.asset.findUnique({ where: { id } });
    if (!asset) throw new AppError('Asset not found', 404);

    if (data.serialNumber && data.serialNumber !== asset.serialNumber) {
      const existingSN = await prisma.asset.findFirst({
        where: { serialNumber: data.serialNumber, id: { not: id } },
      });
      if (existingSN) throw new AppError('Serial number already exists', 400);
    }

    const updated = await prisma.asset.update({
      where: { id },
      data: {
        ...data,
        purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : undefined,
        warrantyExpiry: data.warrantyExpiry ? new Date(data.warrantyExpiry) : undefined,
      },
      include: { category: true, department: true },
    });

    await prisma.assetHistory.create({
      data: {
        assetId: id,
        action: 'UPDATED',
        description: `Asset updated`,
        performedBy: updatedBy,
        createdBy: updatedBy,
      },
    });

    return updated;
  }

  async updateStatus(id: string, lifecycleStatus: string, updatedBy: string) {
    const asset = await prisma.asset.findUnique({ where: { id } });
    if (!asset) throw new AppError('Asset not found', 404);

    // Validate status transitions
    if (lifecycleStatus === LifecycleStatus.ALLOCATED && asset.lifecycleStatus !== LifecycleStatus.AVAILABLE) {
      throw new AppError('Only available assets can be allocated', 400);
    }
    if (lifecycleStatus === LifecycleStatus.DISPOSED) {
      // Cannot undo disposal
    }

    const updated = await prisma.asset.update({
      where: { id },
      data: { lifecycleStatus },
    });

    await prisma.assetHistory.create({
      data: {
        assetId: id,
        action: 'STATUS_CHANGE',
        description: `Status changed from ${asset.lifecycleStatus} to ${lifecycleStatus}`,
        oldValue: asset.lifecycleStatus,
        newValue: lifecycleStatus,
        performedBy: updatedBy,
        createdBy: updatedBy,
      },
    });

    return updated;
  }

  async delete(id: string) {
    return prisma.asset.update({
      where: { id },
      data: { isDeleted: true },
    });
  }

  async getStats() {
    const [total, available, allocated, maintenance, retired, disposed, lost] = await Promise.all([
      prisma.asset.count({ where: { isDeleted: false } }),
      prisma.asset.count({ where: { isDeleted: false, lifecycleStatus: 'AVAILABLE' } }),
      prisma.asset.count({ where: { isDeleted: false, lifecycleStatus: 'ALLOCATED' } }),
      prisma.asset.count({ where: { isDeleted: false, lifecycleStatus: 'MAINTENANCE' } }),
      prisma.asset.count({ where: { isDeleted: false, lifecycleStatus: 'RETIRED' } }),
      prisma.asset.count({ where: { isDeleted: false, lifecycleStatus: 'DISPOSED' } }),
      prisma.asset.count({ where: { isDeleted: false, lifecycleStatus: 'LOST' } }),
    ]);

    return { total, available, allocated, maintenance, retired, disposed, lost };
  }
}
