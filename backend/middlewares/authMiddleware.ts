import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

function getJwtSecret() {
  if (process.env.JWT_SECRET) {
    return process.env.JWT_SECRET;
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET must be configured in production.');
  }

  return 'dev-only-jwt-secret';
}

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    role: 'user' | 'admin';
  };
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies.token;

  if (!token) {
    res.status(401).json({
      success: false,
      message: 'Not authorized: No authentication token found.',
      errors: [],
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret()) as { userId: string; role: 'user' | 'admin' };
    
    (req as AuthenticatedRequest).user = {
      userId: decoded.userId,
      role: decoded.role,
    };
    
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Not authorized: Authentication token is invalid or expired.',
      errors: [],
    });
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const user = (req as AuthenticatedRequest).user;

  if (!user || user.role !== 'admin') {
    res.status(403).json({
      success: false,
      message: 'Forbidden: Administrator permissions are required to access this registry.',
      errors: [],
    });
    return;
  }

  next();
}
