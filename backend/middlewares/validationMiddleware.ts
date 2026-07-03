import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

export function validateResult(req: Request, res: Response, next: NextFunction) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: 'Validation failed: Invalid request payload parameters.',
      errors: errors.array().map((err: any) => ({
        field: err.path || err.param,
        message: err.msg,
      })),
    });
    return;
  }
  next();
}
