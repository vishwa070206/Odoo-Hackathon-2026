import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { parsePagination, buildPaginatedResponse } from '../utils/helpers';
import { BookingDTO } from '../dto';
import { PaginationQuery } from '../types';

export class BookingService {
  async list(query: PaginationQuery & { assetId?: string; bookedBy?: string; bookingStatus?: string; date?: string }) {
    const { page, limit, skip, sortBy, sortOrder } = parsePagination(query);

    const where: any = { isDeleted: false };
    if (query.assetId) where.assetId = query.assetId;
    if (query.bookedBy) where.bookedBy = query.bookedBy;
    if (query.bookingStatus) where.bookingStatus = query.bookingStatus;
    if (query.search) {
      where.OR = [
        { title: { contains: query.search } },
        { asset: { name: { contains: query.search } } },
      ];
    }
    if (query.date) {
      const d = new Date(query.date);
      const nextDay = new Date(d);
      nextDay.setDate(nextDay.getDate() + 1);
      where.startTime = { gte: d, lt: nextDay };
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy || 'startTime']: sortOrder },
        include: {
          asset: { select: { id: true, name: true, assetTag: true, location: true } },
          user: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
      }),
      prisma.booking.count({ where }),
    ]);

    return buildPaginatedResponse(bookings, total, page, limit);
  }

  async getCalendarEvents(start: string, end: string, assetId?: string) {
    const where: any = {
      isDeleted: false,
      startTime: { gte: new Date(start) },
      endTime: { lte: new Date(end) },
    };
    if (assetId) where.assetId = assetId;

    return prisma.booking.findMany({
      where,
      include: {
        asset: { select: { id: true, name: true, assetTag: true } },
        user: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { startTime: 'asc' },
    });
  }

  async create(data: BookingDTO, bookedBy: string) {
    const asset = await prisma.asset.findUnique({ where: { id: data.assetId } });
    if (!asset) throw new AppError('Asset not found', 404);
    if (!asset.isBookable) throw new AppError('This asset is not bookable', 400);
    if (asset.lifecycleStatus === 'RETIRED') throw new AppError('Retired assets cannot be booked', 400);
    if (asset.lifecycleStatus === 'DISPOSED') throw new AppError('Disposed assets cannot be booked', 400);

    const startTime = new Date(data.startTime);
    const endTime = new Date(data.endTime);

    if (endTime <= startTime) throw new AppError('End time must be after start time', 400);

    // Check for overlapping bookings
    const overlap = await prisma.booking.findFirst({
      where: {
        assetId: data.assetId,
        bookingStatus: { in: ['UPCOMING', 'ONGOING'] },
        isDeleted: false,
        OR: [
          { startTime: { lt: endTime }, endTime: { gt: startTime } },
        ],
      },
    });
    if (overlap) throw new AppError('Booking conflicts with an existing reservation', 400);

    const booking = await prisma.booking.create({
      data: {
        assetId: data.assetId,
        bookedBy,
        title: data.title,
        description: data.description,
        startTime,
        endTime,
        createdBy: bookedBy,
      },
      include: {
        asset: { select: { id: true, name: true, assetTag: true } },
        user: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    // Notification
    await prisma.notification.create({
      data: {
        userId: bookedBy,
        title: 'Booking Confirmed',
        message: `Your booking for "${asset.name}" on ${startTime.toLocaleDateString()} is confirmed.`,
        type: 'BOOKING',
        link: `/bookings`,
        createdBy: bookedBy,
      },
    });

    return booking;
  }

  async cancel(id: string, reason: string, userId: string) {
    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking) throw new AppError('Booking not found', 404);
    if (booking.bookingStatus === 'COMPLETED' || booking.bookingStatus === 'CANCELLED') {
      throw new AppError('Cannot cancel this booking', 400);
    }

    return prisma.booking.update({
      where: { id },
      data: { bookingStatus: 'CANCELLED', cancelReason: reason },
    });
  }

  async reschedule(id: string, startTime: string, endTime: string) {
    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking) throw new AppError('Booking not found', 404);

    const newStart = new Date(startTime);
    const newEnd = new Date(endTime);

    // Check overlaps excluding current booking
    const overlap = await prisma.booking.findFirst({
      where: {
        assetId: booking.assetId,
        id: { not: id },
        bookingStatus: { in: ['UPCOMING', 'ONGOING'] },
        isDeleted: false,
        OR: [
          { startTime: { lt: newEnd }, endTime: { gt: newStart } },
        ],
      },
    });
    if (overlap) throw new AppError('New time conflicts with an existing booking', 400);

    return prisma.booking.update({
      where: { id },
      data: { startTime: newStart, endTime: newEnd },
    });
  }

  async getBookableAssets() {
    return prisma.asset.findMany({
      where: { isBookable: true, isDeleted: false, lifecycleStatus: { notIn: ['RETIRED', 'DISPOSED', 'LOST'] } },
      select: { id: true, name: true, assetTag: true, location: true, category: { select: { name: true } } },
    });
  }
}
