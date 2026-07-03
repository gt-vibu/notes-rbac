import { noteRepository, NoteData } from '../repositories/noteRepository';
import logger from '../config/logger';

export const noteService = {
  async getNotesForUser(userId: string): Promise<NoteData[]> {
    const notes = await noteRepository.findAllByUser(userId);
    
    // Default sorting logic: pinned notes first, then creation date descending
    notes.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return notes;
  },

  async createNote(userId: string, data: { title?: string; content?: string; color?: string; pinned?: boolean }): Promise<NoteData> {
    const note = await noteRepository.create(userId, data);
    logger.info(`Note created successfully: ${note._id} for user ${userId}`);
    return note;
  },

  async updateNote(id: string, userId: string, data: Partial<NoteData>): Promise<NoteData | null> {
    const note = await noteRepository.updateOwned(id, userId, data);
    if (!note) {
      logger.warn(`Note update failed or access denied: ID ${id} for user ${userId}`);
      return null;
    }
    logger.info(`Note updated successfully: ${id} for user ${userId}`);
    return note;
  },

  async deleteNote(id: string, userId: string): Promise<boolean> {
    const isDeleted = await noteRepository.deleteOwned(id, userId);
    if (!isDeleted) {
      logger.warn(`Note deletion failed or access denied: ID ${id} for user ${userId}`);
      return false;
    }
    logger.info(`Note deleted successfully: ${id} for user ${userId}`);
    return true;
  }
};
