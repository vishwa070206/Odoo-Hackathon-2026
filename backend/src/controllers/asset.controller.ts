import { Response, NextFunction } from 'express';
import { AssetService } from '../services/asset.service';
import { AuthenticatedRequest } from '../middleware/auth';

const assetService = new AssetService();

export class AssetController {
  async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.json(await assetService.list(req.query as any)); }
    catch (error) { next(error); }
  }
  async getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.json(await assetService.getById(req.params.id)); }
    catch (error) { next(error); }
  }
  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.status(201).json(await assetService.create(req.body, req.user!.userId)); }
    catch (error) { next(error); }
  }
  async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.json(await assetService.update(req.params.id, req.body, req.user!.userId)); }
    catch (error) { next(error); }
  }
  async updateStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.json(await assetService.updateStatus(req.params.id, req.body.lifecycleStatus, req.user!.userId)); }
    catch (error) { next(error); }
  }
  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { await assetService.delete(req.params.id); res.json({ message: 'Asset deleted' }); }
    catch (error) { next(error); }
  }
  async getStats(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { res.json(await assetService.getStats()); }
    catch (error) { next(error); }
  }
}
