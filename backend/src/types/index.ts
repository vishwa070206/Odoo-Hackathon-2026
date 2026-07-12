export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export interface AuthRequest extends Express.Request {
  user?: JwtPayload;
}

export enum RoleEnum {
  ADMIN = 'ADMIN',
  ASSET_MANAGER = 'ASSET_MANAGER',
  DEPARTMENT_HEAD = 'DEPARTMENT_HEAD',
  EMPLOYEE = 'EMPLOYEE',
}

export enum LifecycleStatus {
  AVAILABLE = 'AVAILABLE',
  ALLOCATED = 'ALLOCATED',
  RESERVED = 'RESERVED',
  MAINTENANCE = 'MAINTENANCE',
  LOST = 'LOST',
  RETIRED = 'RETIRED',
  DISPOSED = 'DISPOSED',
}

export enum AllocationStatus {
  ACTIVE = 'ACTIVE',
  RETURNED = 'RETURNED',
  OVERDUE = 'OVERDUE',
  TRANSFERRED = 'TRANSFERRED',
}

export enum TransferStatus {
  PENDING = 'PENDING',
  DEPT_HEAD_APPROVED = 'DEPT_HEAD_APPROVED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  COMPLETED = 'COMPLETED',
}

export enum BookingStatus {
  UPCOMING = 'UPCOMING',
  ONGOING = 'ONGOING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum MaintenanceStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
}

export enum AuditCycleStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CLOSED = 'CLOSED',
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  status?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
