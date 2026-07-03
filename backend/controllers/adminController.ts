import { Response, NextFunction } from 'express';
import { adminService } from '../services/adminService';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';

export const adminController = {
  async getUsers(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const search = (req.query.search as string) || '';
      const sort = (req.query.sort as string) || 'createdAt';
      const order = (req.query.order as 'asc' | 'desc') || 'desc';
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 8;
      const role = req.query.role as string;
      const createdAfter = req.query.createdAfter as string;
      const createdBefore = req.query.createdBefore as string;

      const result = await adminService.getUsers({
        search,
        sort,
        order,
        page,
        limit,
        role,
        createdAfter,
        createdBefore,
      });

      // Front-end table binds to this format directly:
      // totalRecords, totalPages, currentPage, pageSize, hasNextPage, hasPreviousPage, results (which corresponds to "users")
      res.status(200).json({
        totalRecords: result.totalRecords,
        totalPages: result.totalPages,
        currentPage: result.currentPage,
        pageSize: result.pageSize,
        hasNextPage: result.hasNextPage,
        hasPreviousPage: result.hasPreviousPage,
        users: result.results, // frontend expects "users" in response of GET /admin/users
      });
    } catch (err) {
      next(err);
    }
  },

  async getNotes(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const search = (req.query.search as string) || '';
      const sort = (req.query.sort as string) || 'createdAt';
      const order = (req.query.order as 'asc' | 'desc') || 'desc';
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 8;
      const ownerId = req.query.ownerId as string;
      const createdAfter = req.query.createdAfter as string;
      const createdBefore = req.query.createdBefore as string;

      const result = await adminService.getNotes({
        search,
        sort,
        order,
        page,
        limit,
        ownerId,
        createdAfter,
        createdBefore,
      });

      res.status(200).json({
        totalRecords: result.totalRecords,
        totalPages: result.totalPages,
        currentPage: result.currentPage,
        pageSize: result.pageSize,
        hasNextPage: result.hasNextPage,
        hasPreviousPage: result.hasPreviousPage,
        notes: result.results, // frontend expects "notes" in response of GET /admin/notes
      });
    } catch (err) {
      next(err);
    }
  },

  async updateUser(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const adminId = req.user!.userId;
      const targetUserId = req.params.id;
      const { role, isLocked } = req.body;

      try {
        const updatedUser = await adminService.updateUser(adminId, targetUserId, { role, isLocked });
        if (!updatedUser) {
          res.status(404).json({
            success: false,
            message: 'Target user account not found.',
            errors: [],
          });
          return;
        }

        res.status(200).json(updatedUser);
      } catch (err: any) {
        res.status(400).json({
          success: false,
          message: err.message || 'Unable to update user privileges.',
          errors: [],
        });
      }
    } catch (err) {
      next(err);
    }
  },

  async deleteUser(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const adminId = req.user!.userId;
      const targetUserId = req.params.id;

      try {
        await adminService.deleteUser(adminId, targetUserId);
        res.status(200).json({
          success: true,
          message: 'User account and all associated thoughts have been successfully deleted.',
        });
      } catch (err: any) {
        res.status(400).json({
          success: false,
          message: err.message || 'Failed to delete target user account.',
          errors: [],
        });
      }
    } catch (err) {
      next(err);
    }
  },

  async deleteNote(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const adminId = req.user!.userId;
      const noteId = req.params.id;

      const deleted = await adminService.deleteNote(adminId, noteId);
      if (!deleted) {
        res.status(404).json({
          success: false,
          message: 'Note card not found in registries.',
          errors: [],
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Note card has been successfully incinerated from registries.',
      });
    } catch (err) {
      next(err);
    }
  },
};
