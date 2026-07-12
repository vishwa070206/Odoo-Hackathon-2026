import { Response, NextFunction } from 'express';
import { AllocationService, TransferService } from '../services/allocation.service';
import { BookingService } from '../services/booking.service';
import { MaintenanceService } from '../services/maintenance.service';
import { AuditService } from '../services/audit.service';
import { NotificationService, ActivityLogService, ReportService } from '../services/notification.service';
import { AuthenticatedRequest } from '../middleware/auth';

const allocationService = new AllocationService();
const transferService = new TransferService();
const bookingService = new BookingService();
const maintenanceService = new MaintenanceService();
const auditService = new AuditService();
const notificationService = new NotificationService();
const activityLogService = new ActivityLogService();
const reportService = new ReportService();

// ─── ALLOCATION CONTROLLER ────────────────────────────
export class AllocationController {
  async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.json(await allocationService.list(req.query as any)); }
    catch (error) { next(error); }
  }
  async allocate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.status(201).json(await allocationService.allocate(req.body, req.user!.userId)); }
    catch (error) { next(error); }
  }
  async returnAsset(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.json(await allocationService.returnAsset(req.body, req.user!.userId)); }
    catch (error) { next(error); }
  }
  async getOverdue(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.json(await allocationService.getOverdue()); }
    catch (error) { next(error); }
  }
}

// ─── TRANSFER CONTROLLER ──────────────────────────────
export class TransferController {
  async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.json(await transferService.list(req.query as any)); }
    catch (error) { next(error); }
  }
  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.status(201).json(await transferService.create(req.body, req.user!.userId)); }
    catch (error) { next(error); }
  }
  async approve(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.json(await transferService.approve(req.params.id, req.user!.userId)); }
    catch (error) { next(error); }
  }
  async reject(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.json(await transferService.reject(req.params.id, req.user!.userId)); }
    catch (error) { next(error); }
  }
  async complete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.json(await transferService.complete(req.params.id)); }
    catch (error) { next(error); }
  }
}

// ─── BOOKING CONTROLLER ───────────────────────────────
export class BookingController {
  async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.json(await bookingService.list(req.query as any)); }
    catch (error) { next(error); }
  }
  async getCalendarEvents(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { start, end, assetId } = req.query as any;
      res.json(await bookingService.getCalendarEvents(start, end, assetId));
    } catch (error) { next(error); }
  }
  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.status(201).json(await bookingService.create(req.body, req.user!.userId)); }
    catch (error) { next(error); }
  }
  async cancel(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.json(await bookingService.cancel(req.params.id, req.body.reason || '', req.user!.userId)); }
    catch (error) { next(error); }
  }
  async reschedule(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.json(await bookingService.reschedule(req.params.id, req.body.startTime, req.body.endTime)); }
    catch (error) { next(error); }
  }
  async getBookableAssets(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.json(await bookingService.getBookableAssets()); }
    catch (error) { next(error); }
  }
}

// ─── MAINTENANCE CONTROLLER ───────────────────────────
export class MaintenanceController {
  async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.json(await maintenanceService.list(req.query as any)); }
    catch (error) { next(error); }
  }
  async getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.json(await maintenanceService.getById(req.params.id)); }
    catch (error) { next(error); }
  }
  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.status(201).json(await maintenanceService.create(req.body, req.user!.userId)); }
    catch (error) { next(error); }
  }
  async updateWorkflow(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { workflowStatus, assignedTo, resolution, cost } = req.body;
      res.json(await maintenanceService.updateWorkflow(req.params.id, workflowStatus, req.user!.userId, { assignedTo, resolution, cost }));
    } catch (error) { next(error); }
  }
}

// ─── AUDIT CONTROLLER ─────────────────────────────────
export class AuditController {
  async listCycles(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.json(await auditService.listCycles(req.query as any)); }
    catch (error) { next(error); }
  }
  async getCycleById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.json(await auditService.getCycleById(req.params.id)); }
    catch (error) { next(error); }
  }
  async createCycle(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.status(201).json(await auditService.createCycle(req.body, req.user!.userId)); }
    catch (error) { next(error); }
  }
  async assignAuditor(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { auditorId, scope } = req.body;
      res.json(await auditService.assignAuditor(req.params.id, auditorId, scope, req.user!.userId));
    } catch (error) { next(error); }
  }
  async verifyItem(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { verificationStatus, notes } = req.body;
      res.json(await auditService.verifyItem(req.params.itemId, verificationStatus, notes, req.user!.userId));
    } catch (error) { next(error); }
  }
  async closeCycle(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.json(await auditService.closeCycle(req.params.id)); }
    catch (error) { next(error); }
  }
}

// ─── NOTIFICATION CONTROLLER ──────────────────────────
export class NotificationController {
  async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.json(await notificationService.list(req.user!.userId, req.query as any)); }
    catch (error) { next(error); }
  }
  async getUnreadCount(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.json({ count: await notificationService.getUnreadCount(req.user!.userId) }); }
    catch (error) { next(error); }
  }
  async markAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { await notificationService.markAsRead(req.params.id, req.user!.userId); res.json({ message: 'Marked as read' }); }
    catch (error) { next(error); }
  }
  async markAllAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { await notificationService.markAllAsRead(req.user!.userId); res.json({ message: 'All marked as read' }); }
    catch (error) { next(error); }
  }
}

// ─── ACTIVITY LOG CONTROLLER ──────────────────────────
export class ActivityLogController {
  async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.json(await activityLogService.list(req.query as any)); }
    catch (error) { next(error); }
  }
}

// ─── REPORT CONTROLLER ────────────────────────────────
export class ReportController {
  async getDashboardKPIs(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.json(await reportService.getDashboardKPIs()); }
    catch (error) { next(error); }
  }
  async getAssetUtilization(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.json(await reportService.getAssetUtilization()); }
    catch (error) { next(error); }
  }
  async getDepartmentAllocation(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.json(await reportService.getDepartmentAllocation()); }
    catch (error) { next(error); }
  }
  async getMaintenanceCost(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.json(await reportService.getMaintenanceCost()); }
    catch (error) { next(error); }
  }
  async getBookingHeatmap(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate } = req.query as any;
      res.json(await reportService.getBookingHeatmap(startDate, endDate));
    } catch (error) { next(error); }
  }
  async getAuditSummary(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.json(await reportService.getAuditSummary()); }
    catch (error) { next(error); }
  }
  async getUpcomingReturns(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.json(await reportService.getUpcomingReturns()); }
    catch (error) { next(error); }
  }
}
