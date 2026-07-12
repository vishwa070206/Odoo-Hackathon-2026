import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { AuthenticatedRequest } from '../middleware/auth';

const authService = new AuthService();

export class AuthController {
  async signup(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.signup(req.body);
      res.status(201).json(result);
    } catch (error) { next(error); }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.login(req.body);
      res.json(result);
    } catch (error) { next(error); }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) { res.status(400).json({ message: 'Refresh token required' }); return; }
      const result = await authService.refreshToken(refreshToken);
      res.json(result);
    } catch (error) { next(error); }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.forgotPassword(req.body.email);
      res.json(result);
    } catch (error) { next(error); }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.resetPassword(req.body.token, req.body.password);
      res.json(result);
    } catch (error) { next(error); }
  }

  async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.verifyEmail(req.query.token as string);
      res.json(result);
    } catch (error) { next(error); }
  }

  async getMe(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await authService.getMe(req.user!.userId);
      res.json(result);
    } catch (error) { next(error); }
  }

  async logout(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await authService.logout(req.user!.userId);
      res.json(result);
    } catch (error) { next(error); }
  }
}
