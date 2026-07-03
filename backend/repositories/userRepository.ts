import fs from 'fs';
import path from 'path';
import User from '../models/User';
import { isMongoEnabled } from '../config/db';

const DB_FILE = path.resolve('db.json');

// Interface matching Mongoose/JSON user properties
export interface UserData {
  _id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: 'user' | 'admin';
  loginAttempts: number;
  lockUntil: string | null;
  createdAt: string;
}

// Helper to load/save JSON database
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

export const userRepository = {
  async findByEmail(email: string): Promise<UserData | null> {
    if (isMongoEnabled()) {
      const u = await (User as any).findOne({ email: email.toLowerCase() }).exec();
      if (!u) return null;
      return {
        _id: u._id.toString(),
        email: u.email,
        passwordHash: u.passwordHash,
        name: u.name,
        role: u.role,
        loginAttempts: u.loginAttempts,
        lockUntil: u.lockUntil ? u.lockUntil.toISOString() : null,
        createdAt: u.createdAt.toISOString(),
      };
    } else {
      const db = loadJSONDB();
      const u = db.users.find((user: any) => user.email.toLowerCase() === email.toLowerCase());
      return u || null;
    }
  },

  async findById(id: string): Promise<UserData | null> {
    if (isMongoEnabled()) {
      const u = await (User as any).findById(id).exec();
      if (!u) return null;
      return {
        _id: u._id.toString(),
        email: u.email,
        passwordHash: u.passwordHash,
        name: u.name,
        role: u.role,
        loginAttempts: u.loginAttempts,
        lockUntil: u.lockUntil ? u.lockUntil.toISOString() : null,
        createdAt: u.createdAt.toISOString(),
      };
    } else {
      const db = loadJSONDB();
      const u = db.users.find((user: any) => user._id === id);
      return u || null;
    }
  },

  async create(data: { email: string; passwordHash: string; name: string; role?: 'user' | 'admin' }): Promise<UserData> {
    if (isMongoEnabled()) {
      const u = new User({
        email: data.email.toLowerCase(),
        passwordHash: data.passwordHash,
        name: data.name,
        role: data.role || 'user',
      });
      await u.save();
      return {
        _id: u._id.toString(),
        email: u.email,
        passwordHash: u.passwordHash,
        name: u.name,
        role: u.role,
        loginAttempts: u.loginAttempts,
        lockUntil: u.lockUntil ? u.lockUntil.toISOString() : null,
        createdAt: u.createdAt.toISOString(),
      };
    } else {
      const db = loadJSONDB();
      const newUser: UserData = {
        _id: 'user-' + Math.random().toString(36).substr(2, 9),
        email: data.email.toLowerCase(),
        passwordHash: data.passwordHash,
        name: data.name,
        role: data.role || 'user',
        loginAttempts: 0,
        lockUntil: null,
        createdAt: new Date().toISOString(),
      };
      db.users.push(newUser);
      saveJSONDB(db);
      return newUser;
    }
  },

  async update(id: string, data: Partial<UserData>): Promise<UserData | null> {
    if (isMongoEnabled()) {
      const updateObj: any = { ...data };
      if (data.lockUntil !== undefined) {
        updateObj.lockUntil = data.lockUntil ? new Date(data.lockUntil) : null;
      }
      const u = await (User as any).findByIdAndUpdate(id, { $set: updateObj }, { new: true }).exec();
      if (!u) return null;
      return {
        _id: u._id.toString(),
        email: u.email,
        passwordHash: u.passwordHash,
        name: u.name,
        role: u.role,
        loginAttempts: u.loginAttempts,
        lockUntil: u.lockUntil ? u.lockUntil.toISOString() : null,
        createdAt: u.createdAt.toISOString(),
      };
    } else {
      const db = loadJSONDB();
      const userIndex = db.users.findIndex((user: any) => user._id === id);
      if (userIndex === -1) return null;
      
      const updatedUser = {
        ...db.users[userIndex],
        ...data,
      };
      db.users[userIndex] = updatedUser;
      saveJSONDB(db);
      return updatedUser;
    }
  },

  async delete(id: string): Promise<boolean> {
    if (isMongoEnabled()) {
      const res = await (User as any).findByIdAndDelete(id).exec();
      return !!res;
    } else {
      const db = loadJSONDB();
      const originalLen = db.users.length;
      db.users = db.users.filter((user: any) => user._id !== id);
      saveJSONDB(db);
      return db.users.length < originalLen;
    }
  },

  async countAdmins(): Promise<number> {
    if (isMongoEnabled()) {
      return await (User as any).countDocuments({ role: 'admin' }).exec();
    } else {
      const db = loadJSONDB();
      return db.users.filter((user: any) => user.role === 'admin').length;
    }
  },

  async findAllPaginated(options: {
    search: string;
    sort: string;
    order: 'asc' | 'desc';
    page: number;
    limit: number;
    role?: string;
    isDeleted?: boolean;
    createdAfter?: string;
    createdBefore?: string;
  }): Promise<{ users: UserData[]; totalRecords: number }> {
    const { search, sort, order, page, limit, role, createdAfter, createdBefore } = options;

    if (isMongoEnabled()) {
      const query: any = {};
      
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ];
      }
      
      if (role) {
        query.role = role;
      }

      if (createdAfter || createdBefore) {
        query.createdAt = {};
        if (createdAfter) query.createdAt.$gte = new Date(createdAfter);
        if (createdBefore) query.createdAt.$lte = new Date(createdBefore);
      }

      const sortOrderVal = order === 'asc' ? 1 : -1;
      const sortQuery: any = {};
      sortQuery[sort] = sortOrderVal;

      const totalRecords = await (User as any).countDocuments(query).exec();
      const usersDocs = await (User as any).find(query)
        .sort(sortQuery)
        .skip((page - 1) * limit)
        .limit(limit)
        .exec();

      const users = usersDocs.map((u: any) => ({
        _id: u._id.toString(),
        email: u.email,
        passwordHash: u.passwordHash,
        name: u.name,
        role: u.role,
        loginAttempts: u.loginAttempts,
        lockUntil: u.lockUntil ? u.lockUntil.toISOString() : null,
        createdAt: u.createdAt.toISOString(),
      }));

      return { users, totalRecords };
    } else {
      const db = loadJSONDB();
      let filtered = [...db.users];

      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
      }

      if (role) {
        filtered = filtered.filter(u => u.role === role);
      }

      if (createdAfter) {
        filtered = filtered.filter(u => new Date(u.createdAt) >= new Date(createdAfter));
      }

      if (createdBefore) {
        filtered = filtered.filter(u => new Date(u.createdAt) <= new Date(createdBefore));
      }

      // Sort
      filtered.sort((a: any, b: any) => {
        let valA = a[sort];
        let valB = b[sort];

        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();

        if (valA < valB) return order === 'asc' ? -1 : 1;
        if (valA > valB) return order === 'asc' ? 1 : -1;
        return 0;
      });

      const totalRecords = filtered.length;
      const startIndex = (page - 1) * limit;
      const paginated = filtered.slice(startIndex, startIndex + limit);

      return { users: paginated, totalRecords };
    }
  }
};
