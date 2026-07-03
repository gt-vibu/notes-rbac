import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import Note from '../models/Note';
import { isMongoEnabled } from '../config/db';

const DB_FILE = path.resolve('db.json');

export interface NoteData {
  _id: string;
  userId: string;
  title: string;
  content: string;
  color: string;
  pinned: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminNoteData extends NoteData {
  user: {
    name: string;
    email: string;
  };
}

function loadJSONDB() {
  if (!fs.existsSync(DB_FILE)) {
    return { users: [], notes: [] };
  }
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  } catch {
    return { users: [], notes: [] };
  }
}

function saveJSONDB(db: any) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

export const noteRepository = {
  async findOwnedById(id: string, userId: string): Promise<NoteData | null> {
    if (isMongoEnabled()) {
      if (!mongoose.Types.ObjectId.isValid(id)) return null;
      const n = await (Note as any).findOne({ _id: id, userId, isDeleted: false }).exec();
      if (!n) return null;
      return {
        _id: n._id.toString(),
        userId: n.userId.toString(),
        title: n.title,
        content: n.content,
        color: n.color,
        pinned: n.pinned,
        isDeleted: n.isDeleted,
        createdAt: n.createdAt.toISOString(),
        updatedAt: n.updatedAt.toISOString(),
      };
    } else {
      const db = loadJSONDB();
      const n = db.notes.find((note: any) => note._id === id && note.userId === userId && !note.isDeleted);
      return n || null;
    }
  },

  async findById(id: string): Promise<NoteData | null> {
    if (isMongoEnabled()) {
      if (!mongoose.Types.ObjectId.isValid(id)) return null;
      const n = await (Note as any).findById(id).exec();
      if (!n) return null;
      return {
        _id: n._id.toString(),
        userId: n.userId.toString(),
        title: n.title,
        content: n.content,
        color: n.color,
        pinned: n.pinned,
        isDeleted: n.isDeleted,
        createdAt: n.createdAt.toISOString(),
        updatedAt: n.updatedAt.toISOString(),
      };
    } else {
      const db = loadJSONDB();
      const n = db.notes.find((note: any) => note._id === id);
      return n || null;
    }
  },

  async create(userId: string, data: { title?: string; content?: string; color?: string; pinned?: boolean }): Promise<NoteData> {
    if (isMongoEnabled()) {
      const n = new Note({
        userId: new mongoose.Types.ObjectId(userId),
        title: data.title || '',
        content: data.content || '',
        color: data.color || 'clay',
        pinned: !!data.pinned,
        isDeleted: false,
      });
      await n.save();
      return {
        _id: n._id.toString(),
        userId: n.userId.toString(),
        title: n.title,
        content: n.content,
        color: n.color,
        pinned: n.pinned,
        isDeleted: n.isDeleted,
        createdAt: n.createdAt.toISOString(),
        updatedAt: n.updatedAt.toISOString(),
      };
    } else {
      const db = loadJSONDB();
      const newNote: NoteData = {
        _id: 'note-' + Math.random().toString(36).substr(2, 9),
        userId,
        title: data.title || '',
        content: data.content || '',
        color: data.color || 'clay',
        pinned: !!data.pinned,
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      db.notes.push(newNote);
      saveJSONDB(db);
      return newNote;
    }
  },

  async updateOwned(id: string, userId: string, data: Partial<NoteData>): Promise<NoteData | null> {
    if (isMongoEnabled()) {
      if (!mongoose.Types.ObjectId.isValid(id)) return null;
      const n = await (Note as any).findOneAndUpdate(
        { _id: id, userId },
        { $set: data },
        { new: true }
      ).exec();
      if (!n) return null;
      return {
        _id: n._id.toString(),
        userId: n.userId.toString(),
        title: n.title,
        content: n.content,
        color: n.color,
        pinned: n.pinned,
        isDeleted: n.isDeleted,
        createdAt: n.createdAt.toISOString(),
        updatedAt: n.updatedAt.toISOString(),
      };
    } else {
      const db = loadJSONDB();
      const idx = db.notes.findIndex((note: any) => note._id === id && note.userId === userId);
      if (idx === -1) return null;
      
      const updated = {
        ...db.notes[idx],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      db.notes[idx] = updated;
      saveJSONDB(db);
      return updated;
    }
  },

  async deleteOwned(id: string, userId: string): Promise<boolean> {
    if (isMongoEnabled()) {
      if (!mongoose.Types.ObjectId.isValid(id)) return false;
      const res = await (Note as any).findOneAndDelete({ _id: id, userId }).exec();
      return !!res;
    } else {
      const db = loadJSONDB();
      const originalLen = db.notes.length;
      db.notes = db.notes.filter((note: any) => !(note._id === id && note.userId === userId));
      saveJSONDB(db);
      return db.notes.length < originalLen;
    }
  },

  async deleteByAdmin(id: string): Promise<boolean> {
    if (isMongoEnabled()) {
      if (!mongoose.Types.ObjectId.isValid(id)) return false;
      const res = await (Note as any).findByIdAndDelete(id).exec();
      return !!res;
    } else {
      const db = loadJSONDB();
      const originalLen = db.notes.length;
      db.notes = db.notes.filter((note: any) => note._id !== id);
      saveJSONDB(db);
      return db.notes.length < originalLen;
    }
  },

  async deleteByUser(userId: string): Promise<void> {
    if (isMongoEnabled()) {
      await (Note as any).deleteMany({ userId }).exec();
    } else {
      const db = loadJSONDB();
      db.notes = db.notes.filter((note: any) => note.userId !== userId);
      saveJSONDB(db);
    }
  },

  async findAllByUser(userId: string): Promise<NoteData[]> {
    if (isMongoEnabled()) {
      const notesDocs = await (Note as any).find({ userId, isDeleted: false }).exec();
      return notesDocs.map((n: any) => ({
        _id: n._id.toString(),
        userId: n.userId.toString(),
        title: n.title,
        content: n.content,
        color: n.color,
        pinned: n.pinned,
        isDeleted: n.isDeleted,
        createdAt: n.createdAt.toISOString(),
        updatedAt: n.updatedAt.toISOString(),
      }));
    } else {
      const db = loadJSONDB();
      return db.notes.filter((note: any) => note.userId === userId && !note.isDeleted);
    }
  },

  async findAllPaginated(options: {
    search: string;
    sort: string;
    order: 'asc' | 'desc';
    page: number;
    limit: number;
    ownerId?: string;
    createdAfter?: string;
    createdBefore?: string;
  }): Promise<{ notes: AdminNoteData[]; totalRecords: number }> {
    const { search, sort, order, page, limit, ownerId, createdAfter, createdBefore } = options;

    if (isMongoEnabled()) {
      const matchQuery: any = { isDeleted: false };
      
      if (ownerId) {
        matchQuery.userId = new mongoose.Types.ObjectId(ownerId);
      }

      if (createdAfter || createdBefore) {
        matchQuery.createdAt = {};
        if (createdAfter) matchQuery.createdAt.$gte = new Date(createdAfter);
        if (createdBefore) matchQuery.createdAt.$lte = new Date(createdBefore);
      }

      const pipeline: any[] = [
        { $match: matchQuery },
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'userDoc',
          }
        },
        {
          $unwind: {
            path: '$userDoc',
            preserveNullAndEmptyArrays: true,
          }
        },
        {
          $project: {
            _id: 1,
            userId: 1,
            title: 1,
            content: 1,
            color: 1,
            pinned: 1,
            isDeleted: 1,
            createdAt: 1,
            updatedAt: 1,
            user: {
              name: { $ifNull: ['$userDoc.name', 'Unknown'] },
              email: { $ifNull: ['$userDoc.email', 'unknown@user.com'] },
            }
          }
        }
      ];

      // Match user and title/content for search
      if (search) {
        const regexSearch = { $regex: search, $options: 'i' };
        pipeline.push({
          $match: {
            $or: [
              { title: regexSearch },
              { content: regexSearch },
              { 'user.name': regexSearch },
              { 'user.email': regexSearch },
            ]
          }
        });
      }

      // Count total matching records
      const totalPipeline = [...pipeline, { $count: 'count' }];
      const totalResult = await (Note as any).aggregate(totalPipeline).exec();
      const totalRecords = totalResult.length > 0 ? totalResult[0].count : 0;

      // Sorting
      const sortFieldVal = sort === 'userName' ? 'user.name' : sort;
      const sortOrderVal = order === 'asc' ? 1 : -1;
      const sortStage: any = {};
      sortStage[sortFieldVal] = sortOrderVal;
      pipeline.push({ $sort: sortStage });

      // Pagination
      pipeline.push({ $skip: (page - 1) * limit });
      pipeline.push({ $limit: limit });

      const notesDocs = await (Note as any).aggregate(pipeline).exec();

      const notes: AdminNoteData[] = notesDocs.map((n: any) => ({
        _id: n._id.toString(),
        userId: n.userId.toString(),
        title: n.title,
        content: n.content,
        color: n.color,
        pinned: n.pinned,
        isDeleted: n.isDeleted,
        createdAt: n.createdAt.toISOString(),
        updatedAt: n.updatedAt.toISOString(),
        user: {
          name: n.user.name,
          email: n.user.email,
        }
      }));

      return { notes, totalRecords };
    } else {
      const db = loadJSONDB();
      let notesWithUser: AdminNoteData[] = db.notes
        .filter((n: any) => !n.isDeleted)
        .map((note: any) => {
          const u = db.users.find((user: any) => user._id === note.userId);
          return {
            ...note,
            user: u ? { name: u.name, email: u.email } : { name: 'Unknown', email: 'unknown@user.com' },
          };
        });

      if (ownerId) {
        notesWithUser = notesWithUser.filter((n) => n.userId === ownerId);
      }

      if (createdAfter) {
        notesWithUser = notesWithUser.filter((n) => new Date(n.createdAt) >= new Date(createdAfter));
      }

      if (createdBefore) {
        notesWithUser = notesWithUser.filter((n) => new Date(n.createdAt) <= new Date(createdBefore));
      }

      // Search
      if (search) {
        const q = search.toLowerCase();
        notesWithUser = notesWithUser.filter(n =>
          n.title.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q) ||
          n.user.name.toLowerCase().includes(q) ||
          n.user.email.toLowerCase().includes(q)
        );
      }

      // Sort
      notesWithUser.sort((a: any, b: any) => {
        let valA = a[sort];
        let valB = b[sort];

        if (sort === 'userName') {
          valA = a.user.name;
          valB = b.user.name;
        }

        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();

        if (valA < valB) return order === 'asc' ? -1 : 1;
        if (valA > valB) return order === 'asc' ? 1 : -1;
        return 0;
      });

      const totalRecords = notesWithUser.length;
      const startIndex = (page - 1) * limit;
      const paginated = notesWithUser.slice(startIndex, startIndex + limit);

      return { notes: paginated, totalRecords };
    }
  }
};
