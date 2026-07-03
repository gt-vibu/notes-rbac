import { Response, NextFunction } from 'express';
import { noteService } from '../services/noteService';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';

export const noteController = {
  async getNotes(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const notes = await noteService.getNotesForUser(userId);
      res.status(200).json(notes);
    } catch (err) {
      next(err);
    }
  },

  async createNote(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { title, content, color, pinned } = req.body;
      const note = await noteService.createNote(userId, { title, content, color, pinned });
      res.status(201).json(note);
    } catch (err) {
      next(err);
    }
  },

  async updateNote(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const { title, content, color, pinned, isDeleted } = req.body;

      const updatedNote = await noteService.updateNote(id, userId, {
        title,
        content,
        color,
        pinned,
        isDeleted,
      });

      if (!updatedNote) {
        res.status(404).json({
          success: false,
          message: 'Note not found or you are not authorized to access it.',
          errors: [],
        });
        return;
      }

      res.status(200).json(updatedNote);
    } catch (err) {
      next(err);
    }
  },

  async deleteNote(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;

      const success = await noteService.deleteNote(id, userId);

      if (!success) {
        res.status(404).json({
          success: false,
          message: 'Note not found or you are not authorized to access it.',
          errors: [],
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Note deleted successfully',
      });
    } catch (err) {
      next(err);
    }
  },
};
