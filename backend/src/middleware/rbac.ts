import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth';
import { RoleEnum } from '../types';

export const rbacMiddleware = (...allowedRoles: RoleEnum[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    if (!allowedRoles.includes(req.user.role as RoleEnum)) {
      res.status(403).json({ message: 'Insufficient permissions' });
      return;
    }

    next();
  };
};

// Shorthand role checks
export const adminOnly = rbacMiddleware(RoleEnum.ADMIN);
export const managerOrAdmin = rbacMiddleware(RoleEnum.ADMIN, RoleEnum.ASSET_MANAGER);
export const deptHeadOrAbove = rbacMiddleware(RoleEnum.ADMIN, RoleEnum.ASSET_MANAGER, RoleEnum.DEPARTMENT_HEAD);
export const anyAuthenticated = rbacMiddleware(RoleEnum.ADMIN, RoleEnum.ASSET_MANAGER, RoleEnum.DEPARTMENT_HEAD, RoleEnum.EMPLOYEE);
