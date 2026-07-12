import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { DepartmentController, CategoryController } from '../controllers/org.controller';
import { AssetController } from '../controllers/asset.controller';
import {
  AllocationController, TransferController, BookingController,
  MaintenanceController, AuditController, NotificationController,
  ActivityLogController, ReportController
} from '../controllers/module.controller';
import { authMiddleware } from '../middleware/auth';
import { adminOnly, managerOrAdmin, deptHeadOrAbove, anyAuthenticated } from '../middleware/rbac';
import { validate } from '../middleware/validate';
import {
  departmentSchema, categorySchema, assetSchema, allocationSchema,
  transferSchema, returnSchema, bookingSchema, maintenanceSchema,
  auditCycleSchema, auditItemVerifySchema, promoteUserSchema, updateUserSchema
} from '../dto';
import { upload } from '../middleware/upload';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// ─── USERS ─────────────────────────────────────────
const userCtrl = new UserController();
router.get('/users', userCtrl.list);
router.get('/users/roles', userCtrl.getRoles);
router.get('/users/:id', userCtrl.getById);
router.put('/users/:id', validate(updateUserSchema), userCtrl.update);
router.patch('/users/:id/promote', adminOnly, validate(promoteUserSchema), userCtrl.promote);
router.patch('/users/:id/deactivate', adminOnly, userCtrl.deactivate);
router.patch('/users/:id/activate', adminOnly, userCtrl.activate);

// ─── DEPARTMENTS ───────────────────────────────────
const deptCtrl = new DepartmentController();
router.get('/departments', deptCtrl.list);
router.get('/departments/hierarchy', deptCtrl.getHierarchy);
router.get('/departments/:id', deptCtrl.getById);
router.post('/departments', adminOnly, validate(departmentSchema), deptCtrl.create);
router.put('/departments/:id', adminOnly, validate(departmentSchema), deptCtrl.update);
router.patch('/departments/:id/deactivate', adminOnly, deptCtrl.deactivate);

// ─── CATEGORIES ────────────────────────────────────
const catCtrl = new CategoryController();
router.get('/categories', catCtrl.list);
router.get('/categories/:id', catCtrl.getById);
router.post('/categories', managerOrAdmin, validate(categorySchema), catCtrl.create);
router.put('/categories/:id', managerOrAdmin, validate(categorySchema), catCtrl.update);
router.delete('/categories/:id', adminOnly, catCtrl.delete);

// ─── ASSETS ────────────────────────────────────────
const assetCtrl = new AssetController();
router.get('/assets', assetCtrl.list);
router.get('/assets/stats', assetCtrl.getStats);
router.get('/assets/:id', assetCtrl.getById);
router.post('/assets', managerOrAdmin, validate(assetSchema), assetCtrl.create);
router.put('/assets/:id', managerOrAdmin, validate(assetSchema), assetCtrl.update);
router.patch('/assets/:id/status', managerOrAdmin, assetCtrl.updateStatus);
router.delete('/assets/:id', adminOnly, assetCtrl.delete);

// Upload endpoints
router.post('/assets/:id/photos', managerOrAdmin, upload.array('photos', 5), async (req, res) => {
  const files = req.files as Express.Multer.File[];
  if (!files?.length) { res.status(400).json({ message: 'No files uploaded' }); return; }
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  const photos = await Promise.all(files.map((f, i) =>
    prisma.assetPhoto.create({
      data: { assetId: req.params.id, url: `/uploads/${f.filename}`, isPrimary: i === 0, createdBy: (req as any).user?.userId },
    })
  ));
  res.json(photos);
});

router.post('/assets/:id/documents', managerOrAdmin, upload.array('documents', 5), async (req, res) => {
  const files = req.files as Express.Multer.File[];
  if (!files?.length) { res.status(400).json({ message: 'No files uploaded' }); return; }
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  const docs = await Promise.all(files.map(f =>
    prisma.assetDocument.create({
      data: {
        assetId: req.params.id, name: f.originalname, type: 'OTHER',
        url: `/uploads/${f.filename}`, size: f.size, createdBy: (req as any).user?.userId,
      },
    })
  ));
  res.json(docs);
});

// ─── ALLOCATIONS ───────────────────────────────────
const allocCtrl = new AllocationController();
router.get('/allocations', allocCtrl.list);
router.get('/allocations/overdue', allocCtrl.getOverdue);
router.post('/allocations', managerOrAdmin, validate(allocationSchema), allocCtrl.allocate);
router.post('/allocations/return', managerOrAdmin, validate(returnSchema), allocCtrl.returnAsset);

// ─── TRANSFERS ─────────────────────────────────────
const transferCtrl = new TransferController();
router.get('/transfers', transferCtrl.list);
router.post('/transfers', validate(transferSchema), transferCtrl.create);
router.patch('/transfers/:id/approve', deptHeadOrAbove, transferCtrl.approve);
router.patch('/transfers/:id/reject', deptHeadOrAbove, transferCtrl.reject);
router.patch('/transfers/:id/complete', managerOrAdmin, transferCtrl.complete);

// ─── BOOKINGS ──────────────────────────────────────
const bookingCtrl = new BookingController();
router.get('/bookings', bookingCtrl.list);
router.get('/bookings/calendar', bookingCtrl.getCalendarEvents);
router.get('/bookings/bookable-assets', bookingCtrl.getBookableAssets);
router.post('/bookings', validate(bookingSchema), bookingCtrl.create);
router.patch('/bookings/:id/cancel', bookingCtrl.cancel);
router.patch('/bookings/:id/reschedule', bookingCtrl.reschedule);

// ─── MAINTENANCE ───────────────────────────────────
const maintCtrl = new MaintenanceController();
router.get('/maintenance', maintCtrl.list);
router.get('/maintenance/:id', maintCtrl.getById);
router.post('/maintenance', validate(maintenanceSchema), maintCtrl.create);
router.patch('/maintenance/:id/workflow', deptHeadOrAbove, maintCtrl.updateWorkflow);

// ─── AUDITS ────────────────────────────────────────
const auditCtrl = new AuditController();
router.get('/audits', auditCtrl.listCycles);
router.get('/audits/:id', auditCtrl.getCycleById);
router.post('/audits', managerOrAdmin, validate(auditCycleSchema), auditCtrl.createCycle);
router.post('/audits/:id/assign', managerOrAdmin, auditCtrl.assignAuditor);
router.patch('/audits/items/:itemId/verify', validate(auditItemVerifySchema), auditCtrl.verifyItem);
router.patch('/audits/:id/close', managerOrAdmin, auditCtrl.closeCycle);

// ─── REPORTS ───────────────────────────────────────
const reportCtrl = new ReportController();
router.get('/reports/dashboard', reportCtrl.getDashboardKPIs);
router.get('/reports/asset-utilization', reportCtrl.getAssetUtilization);
router.get('/reports/department-allocation', reportCtrl.getDepartmentAllocation);
router.get('/reports/maintenance-cost', reportCtrl.getMaintenanceCost);
router.get('/reports/booking-heatmap', reportCtrl.getBookingHeatmap);
router.get('/reports/audit-summary', reportCtrl.getAuditSummary);
router.get('/reports/upcoming-returns', reportCtrl.getUpcomingReturns);

// ─── NOTIFICATIONS ─────────────────────────────────
const notifCtrl = new NotificationController();
router.get('/notifications', notifCtrl.list);
router.get('/notifications/unread-count', notifCtrl.getUnreadCount);
router.patch('/notifications/:id/read', notifCtrl.markAsRead);
router.patch('/notifications/read-all', notifCtrl.markAllAsRead);

// ─── ACTIVITY LOGS ─────────────────────────────────
const logCtrl = new ActivityLogController();
router.get('/logs', deptHeadOrAbove, logCtrl.list);

// ─── GLOBAL SEARCH ─────────────────────────────────
router.get('/search', async (req, res) => {
  const { q } = req.query;
  if (!q || typeof q !== 'string') { res.json({ assets: [], users: [], departments: [] }); return; }

  const prisma = require('../config/database').default;
  const [assets, users, departments] = await Promise.all([
    prisma.asset.findMany({
      where: { isDeleted: false, OR: [{ name: { contains: q } }, { assetTag: { contains: q } }, { serialNumber: { contains: q } }] },
      take: 5, select: { id: true, name: true, assetTag: true, lifecycleStatus: true },
    }),
    prisma.user.findMany({
      where: { isDeleted: false, OR: [{ firstName: { contains: q } }, { lastName: { contains: q } }, { email: { contains: q } }] },
      take: 5, select: { id: true, firstName: true, lastName: true, email: true },
    }),
    prisma.department.findMany({
      where: { isDeleted: false, OR: [{ name: { contains: q } }, { code: { contains: q } }] },
      take: 5, select: { id: true, name: true, code: true },
    }),
  ]);

  res.json({ assets, users, departments });
});

export default router;
