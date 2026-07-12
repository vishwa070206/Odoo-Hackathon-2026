import { Response, NextFunction } from 'express';
import { DepartmentService } from '../services/department.service';
import { CategoryService } from '../services/category.service';
import { AuthenticatedRequest } from '../middleware/auth';

const departmentService = new DepartmentService();
const categoryService = new CategoryService();

export class DepartmentController {
  async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.json(await departmentService.list(req.query as any)); }
    catch (error) { next(error); }
  }
  async getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.json(await departmentService.getById(req.params.id)); }
    catch (error) { next(error); }
  }
  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.status(201).json(await departmentService.create(req.body, req.user!.userId)); }
    catch (error) { next(error); }
  }
  async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.json(await departmentService.update(req.params.id, req.body)); }
    catch (error) { next(error); }
  }
  async deactivate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { await departmentService.deactivate(req.params.id); res.json({ message: 'Department deactivated' }); }
    catch (error) { next(error); }
  }
  async getHierarchy(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.json(await departmentService.getHierarchy()); }
    catch (error) { next(error); }
  }
}

export class CategoryController {
  async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.json(await categoryService.list(req.query as any)); }
    catch (error) { next(error); }
  }
  async getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.json(await categoryService.getById(req.params.id)); }
    catch (error) { next(error); }
  }
  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.status(201).json(await categoryService.create(req.body, req.user!.userId)); }
    catch (error) { next(error); }
  }
  async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.json(await categoryService.update(req.params.id, req.body)); }
    catch (error) { next(error); }
  }
  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { await categoryService.delete(req.params.id); res.json({ message: 'Category deleted' }); }
    catch (error) { next(error); }
  }
}
