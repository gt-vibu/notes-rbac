import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/authService';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';

const COOKIE_NAME = 'token';
const isProduction = process.env.NODE_ENV === 'production';
const authCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? 'none' as const : 'lax' as const,
};

export const authController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, password } = req.body;
      const result = await authService.register(name, email, password);

      if (!result.success) {
        res.status(result.statusCode).json({
          success: false,
          message: result.error,
          errors: [],
        });
        return;
      }

      // Set JWT HttpOnly cookie
      res.cookie(COOKIE_NAME, result.token, authCookieOptions);

      res.status(result.statusCode).json({
        success: true,
        user: result.user,
      });
    } catch (err) {
      next(err);
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);

      if (!result.success) {
        const responsePayload: any = {
          success: false,
          message: result.error,
          errors: [],
        };
        if (result.lockUntil) {
          responsePayload.lockUntil = result.lockUntil;
        }
        res.status(result.statusCode).json(responsePayload);
        return;
      }

      // Set JWT HttpOnly cookie
      res.cookie(COOKIE_NAME, result.token, authCookieOptions);

      res.status(result.statusCode).json({
        success: true,
        user: result.user,
      });
    } catch (err) {
      next(err);
    }
  },

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      res.clearCookie(COOKIE_NAME, authCookieOptions);
      res.status(200).json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (err) {
      next(err);
    }
  },

  async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as AuthenticatedRequest).user;
      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Not authorized: No active session.',
          errors: [],
        });
        return;
      }

      const userProfile = await authService.getMe(user.userId);
      if (!userProfile) {
        res.status(401).json({
          success: false,
          message: 'Not authorized: User account not found.',
          errors: [],
        });
        return;
      }

      res.status(200).json({
        success: true,
        user: {
          _id: userProfile._id,
          email: userProfile.email,
          name: userProfile.name,
          role: userProfile.role,
        },
      });
    } catch (err) {
      next(err);
    }
  },
};
