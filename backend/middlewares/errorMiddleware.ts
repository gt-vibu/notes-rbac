import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';

export interface CustomError extends Error {
  statusCode?: number;
  errors?: any[];
}

export function errorMiddleware(
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'An unexpected server error occurred.';
  const errors = err.errors || [];

  // Log error via Winston
  logger.error(`[${req.method}] ${req.originalUrl} - Status: ${statusCode} - Error: ${message}`);
  if (err.stack && process.env.NODE_ENV !== 'production') {
    logger.debug(err.stack);
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
}
