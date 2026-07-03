import { body, param } from 'express-validator';
import { validateResult } from '../middlewares/validationMiddleware';

const validColors = ['clay', 'sand', 'blue', 'sage', 'lavender'];

export const createNoteValidator = [
  body()
    .custom((value) => {
      if (!value.title?.trim() && !value.content?.trim()) {
        throw new Error('Note must have a title or content');
      }
      return true;
    }),
    
  body('title')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Title cannot exceed 100 characters'),
    
  body('content')
    .optional()
    .isLength({ max: 10000 })
    .withMessage('Content cannot exceed 10000 characters'),
    
  body('color')
    .optional()
    .isIn(validColors)
    .withMessage(`Color must be one of: ${validColors.join(', ')}`),
    
  body('pinned')
    .optional()
    .isBoolean()
    .withMessage('Pinned status must be a boolean value'),
    
  validateResult,
];

export const updateNoteValidator = [
  param('id')
    .trim()
    .notEmpty()
    .withMessage('Note ID parameter is required'),
    
  body('title')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Title cannot exceed 100 characters'),
    
  body('content')
    .optional()
    .isLength({ max: 10000 })
    .withMessage('Content cannot exceed 10000 characters'),
    
  body('color')
    .optional()
    .isIn(validColors)
    .withMessage(`Color must be one of: ${validColors.join(', ')}`),
    
  body('pinned')
    .optional()
    .isBoolean()
    .withMessage('Pinned status must be a boolean value'),
    
  validateResult,
];
