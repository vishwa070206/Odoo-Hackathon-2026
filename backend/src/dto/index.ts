import { z } from 'zod';

export const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  phone: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

export const departmentSchema = z.object({
  name: z.string().min(2, 'Department name is required'),
  code: z.string().min(2, 'Department code is required'),
  description: z.string().optional(),
  parentId: z.string().uuid().optional().nullable(),
  headId: z.string().uuid().optional().nullable(),
});

export const categorySchema = z.object({
  name: z.string().min(2, 'Category name is required'),
  description: z.string().optional(),
  icon: z.string().optional(),
  parentId: z.string().uuid().optional().nullable(),
  customFields: z.any().optional(),
});

export const assetSchema = z.object({
  name: z.string().min(2, 'Asset name is required'),
  categoryId: z.string().uuid('Invalid category'),
  departmentId: z.string().uuid().optional().nullable(),
  serialNumber: z.string().optional().nullable(),
  purchaseDate: z.string().optional().nullable(),
  acquisitionCost: z.number().min(0).optional().nullable(),
  condition: z.enum(['NEW', 'GOOD', 'FAIR', 'POOR']).optional(),
  location: z.string().optional().nullable(),
  warrantyExpiry: z.string().optional().nullable(),
  brand: z.string().optional().nullable(),
  model: z.string().optional().nullable(),
  vendor: z.string().optional().nullable(),
  isBookable: z.boolean().optional(),
  isShared: z.boolean().optional(),
  expectedLife: z.number().int().min(0).optional().nullable(),
  notes: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
});

export const allocationSchema = z.object({
  assetId: z.string().uuid('Invalid asset'),
  employeeId: z.string().uuid('Invalid employee'),
  departmentId: z.string().uuid().optional().nullable(),
  expectedReturnDate: z.string().optional().nullable(),
  notes: z.string().optional(),
});

export const transferSchema = z.object({
  assetId: z.string().uuid('Invalid asset'),
  allocationId: z.string().uuid().optional().nullable(),
  toDepartmentId: z.string().uuid().optional().nullable(),
  toUserId: z.string().uuid().optional().nullable(),
  reason: z.string().min(1, 'Reason is required'),
});

export const returnSchema = z.object({
  allocationId: z.string().uuid('Invalid allocation'),
  condition: z.enum(['GOOD', 'FAIR', 'POOR', 'DAMAGED']),
  notes: z.string().optional(),
});

export const bookingSchema = z.object({
  assetId: z.string().uuid('Invalid asset'),
  title: z.string().min(2, 'Title is required'),
  description: z.string().optional(),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
});

export const maintenanceSchema = z.object({
  assetId: z.string().uuid('Invalid asset'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  issueType: z.enum(['REPAIR', 'INSPECTION', 'REPLACEMENT', 'CALIBRATION']).optional(),
  title: z.string().min(2, 'Title is required'),
  description: z.string().min(5, 'Description is required'),
});

export const auditCycleSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  description: z.string().optional(),
  departmentId: z.string().uuid().optional().nullable(),
  location: z.string().optional().nullable(),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional().nullable(),
});

export const auditItemVerifySchema = z.object({
  verificationStatus: z.enum(['VERIFIED', 'MISSING', 'DAMAGED']),
  notes: z.string().optional(),
});

export const promoteUserSchema = z.object({
  roleId: z.string().uuid('Invalid role'),
});

export const updateUserSchema = z.object({
  firstName: z.string().min(2).optional(),
  lastName: z.string().min(2).optional(),
  phone: z.string().optional().nullable(),
  departmentId: z.string().uuid().optional().nullable(),
  managerId: z.string().uuid().optional().nullable(),
});

export type SignupDTO = z.infer<typeof signupSchema>;
export type LoginDTO = z.infer<typeof loginSchema>;
export type DepartmentDTO = z.infer<typeof departmentSchema>;
export type CategoryDTO = z.infer<typeof categorySchema>;
export type AssetDTO = z.infer<typeof assetSchema>;
export type AllocationDTO = z.infer<typeof allocationSchema>;
export type TransferDTO = z.infer<typeof transferSchema>;
export type ReturnDTO = z.infer<typeof returnSchema>;
export type BookingDTO = z.infer<typeof bookingSchema>;
export type MaintenanceDTO = z.infer<typeof maintenanceSchema>;
export type AuditCycleDTO = z.infer<typeof auditCycleSchema>;
