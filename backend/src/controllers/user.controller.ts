import { Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';
import { AuthenticatedRequest } from '../middleware/auth';

const userService = new UserService();

export class UserController {
  async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await userService.list(req.query as any);
      res.json(result);
    } catch (error) { next(error); }
  }

  async getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await userService.getById(req.params.id);
      res.json(result);
    } catch (error) { next(error); }
  }

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await userService.update(req.params.id, req.body);
      res.json(result);
    } catch (error) { next(error); }
  }

  async promote(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await userService.promote(req.params.id, req.body.roleId);
      res.json(result);
    } catch (error) { next(error); }
  }

  async deactivate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await userService.deactivate(req.params.id);
      res.json({ message: 'User deactivated' });
    } catch (error) { next(error); }
  }

  async activate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await userService.activate(req.params.id);
      res.json({ message: 'User activated' });
    } catch (error) { next(error); }
  }

  async getRoles(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await userService.getRoles();
      res.json(result);
    } catch (error) { next(error); }
  }
}
