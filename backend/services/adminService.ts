import { userRepository, UserData } from '../repositories/userRepository';
import { noteRepository, AdminNoteData } from '../repositories/noteRepository';
import logger from '../config/logger';

export interface PaginatedResult<T> {
  totalRecords: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  results: T[];
}

export const adminService = {
  async getUsers(options: {
    search: string;
    sort: string;
    order: 'asc' | 'desc';
    page: number;
    limit: number;
    role?: string;
    createdAfter?: string;
    createdBefore?: string;
  }): Promise<PaginatedResult<UserData>> {
    const { page, limit } = options;
    const { users, totalRecords } = await userRepository.findAllPaginated(options);
    
    const totalPages = Math.ceil(totalRecords / limit) || 1;

    return {
      totalRecords,
      totalPages,
      currentPage: page,
      pageSize: limit,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
      results: users,
    };
  },

  async getNotes(options: {
    search: string;
    sort: string;
    order: 'asc' | 'desc';
    page: number;
    limit: number;
    ownerId?: string;
    createdAfter?: string;
    createdBefore?: string;
  }): Promise<PaginatedResult<AdminNoteData>> {
    const { page, limit } = options;
    const { notes, totalRecords } = await noteRepository.findAllPaginated(options);
    
    const totalPages = Math.ceil(totalRecords / limit) || 1;

    return {
      totalRecords,
      totalPages,
      currentPage: page,
      pageSize: limit,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
      results: notes,
    };
  },

  async updateUser(adminId: string, targetUserId: string, data: { role?: 'user' | 'admin'; isLocked?: boolean }): Promise<UserData | null> {
    const targetUser = await userRepository.findById(targetUserId);
    if (!targetUser) return null;

    const updates: Partial<UserData> = {};
    
    if (data.role !== undefined) {
      if (targetUserId === adminId) {
        throw new Error('You cannot modify your own administrative role privileges.');
      }
      updates.role = data.role;
    }

    if (data.isLocked !== undefined) {
      if (targetUserId === adminId) {
        throw new Error('You cannot lock your own administrative account.');
      }
      if (data.isLocked) {
        // Lock for 24 hours
        updates.lockUntil = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      } else {
        updates.lockUntil = null;
        updates.loginAttempts = 0;
      }
    }

    const updatedUser = await userRepository.update(targetUserId, updates);
    if (updatedUser) {
      logger.info(`Admin (${adminId}) updated User (${targetUserId}) fields: ${JSON.stringify(updates)}`);
    }
    return updatedUser;
  },

  async deleteUser(adminId: string, targetUserId: string): Promise<boolean> {
    if (adminId === targetUserId) {
      throw new Error('You cannot incinerate your own active administrator account.');
    }

    const targetUser = await userRepository.findById(targetUserId);
    if (!targetUser) {
      throw new Error('Target user account not found.');
    }

    if (targetUser.role === 'admin') {
      const adminCount = await userRepository.countAdmins();
      if (adminCount <= 1) {
        throw new Error('You cannot delete the last remaining administrator account on this server.');
      }
    }

    // Delete notes associated with this user
    await noteRepository.deleteByUser(targetUserId);

    // Delete user account
    const deleted = await userRepository.delete(targetUserId);
    if (deleted) {
      logger.info(`Admin (${adminId}) deleted User (${targetUserId}) and purged all associated note cards.`);
    }
    return deleted;
  },

  async deleteNote(adminId: string, noteId: string): Promise<boolean> {
    const deleted = await noteRepository.deleteByAdmin(noteId);
    if (deleted) {
      logger.info(`Admin (${adminId}) purged Note (${noteId}) from global registries.`);
    }
    return deleted;
  }
};
