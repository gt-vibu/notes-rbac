import { query, body, param } from 'express-validator';
import { validateResult } from '../middlewares/validationMiddleware';

export const adminQueryValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer')
    .toInt(),
    
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be an integer between 1 and 100')
    .toInt(),
    
  query('sort')
    .optional()
    .trim()
    .isString()
    .withMessage('Sort field must be a valid string'),
    
  query('order')
    .optional()
    .trim()
    .toLowerCase()
    .isIn(['asc', 'desc'])
    .withMessage('Order must be either "asc" or "desc"'),
    
  query('search')
    .optional()
    .trim()
    .isString()
    .withMessage('Search query must be a string'),

  query('role')
    .optional()
    .trim()
    .isIn(['user', 'admin'])
    .withMessage('Role filter must be "user" or "admin"'),

  query('createdAfter')
    .optional()
    .trim()
    .isISO8601()
    .withMessage('createdAfter must be a valid ISO 8601 date string'),

  query('createdBefore')
    .optional()
    .trim()
    .isISO8601()
    .withMessage('createdBefore must be a valid ISO 8601 date string'),
    
  validateResult,
];

export const adminUserUpdateValidator = [
  param('id')
    .trim()
    .notEmpty()
    .withMessage('User ID parameter is required'),
    
  body('role')
    .optional()
    .trim()
    .isIn(['user', 'admin'])
    .withMessage('Role must be either "user" or "admin"'),
    
  body('isLocked')
    .optional()
    .isBoolean()
    .withMessage('isLocked must be a boolean value'),
    
  validateResult,
];
