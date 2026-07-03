import request from 'supertest';
import express from 'express';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';

// Mock DB settings
jest.mock('../config/db', () => ({
  isMongoEnabled: jest.fn(() => false),
  connectDB: jest.fn().mockResolvedValue(false),
}));

import { authService } from '../services/authService';
import { noteService } from '../services/noteService';
import { adminService } from '../services/adminService';
import { userRepository } from '../repositories/userRepository';
import { noteRepository } from '../repositories/noteRepository';

// Setup Mock Application Instance
const app = express();
app.use(express.json());
app.use(cookieParser());

// Import middlewares and routes
import authRoutes from '../routes/authRoutes';
import noteRoutes from '../routes/noteRoutes';
import adminRoutes from '../routes/adminRoutes';
import { errorMiddleware } from '../middlewares/errorMiddleware';

app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/admin', adminRoutes);
app.use(errorMiddleware);

const JWT_SECRET = process.env.JWT_SECRET || 'dev-only-jwt-secret';

describe('🔒 Authentication & Access Suite', () => {
  let userSpy: jest.SpyInstance;
  let createSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('✅ should successfully register a new user under default roles', async () => {
    userSpy = jest.spyOn(userRepository, 'findByEmail').mockResolvedValue(null);
    createSpy = jest.spyOn(userRepository, 'create').mockResolvedValue({
      _id: 'user-new123',
      email: 'new@3dnotes.com',
      passwordHash: 'hashedpassword',
      name: 'Jane Doe',
      role: 'user',
      loginAttempts: 0,
      lockUntil: null,
      createdAt: new Date().toISOString(),
    });

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Jane Doe',
        email: 'new@3dnotes.com',
        password: 'JanePassword123',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.user.role).toBe('user'); // Ignore client supplies, fallback to user
    expect(res.header['set-cookie']).toBeDefined(); // Token cookie set
  });

  it('❌ should reject duplicate registration attempts with a 409 status code', async () => {
    jest.spyOn(userRepository, 'findByEmail').mockResolvedValue({
      _id: 'user-existing',
      email: 'existing@3dnotes.com',
      passwordHash: 'hashedpassword',
      name: 'Existing',
      role: 'user',
      loginAttempts: 0,
      lockUntil: null,
      createdAt: new Date().toISOString(),
    });

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Jane Doe',
        email: 'existing@3dnotes.com',
        password: 'JanePassword123',
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('❌ should trigger a lock state after 5 failed login attempts', async () => {
    // Mock user having 4 failures already
    const mockUser = {
      _id: 'user-lockout',
      email: 'bad@3dnotes.com',
      passwordHash: '$2a$10$Un6WbNidb2/TfTf8KzB2reR8vTvef3pCO1R7M6M4TfeWz9gYve0v2', // Hashed "correctPassword"
      name: 'Lock target',
      role: 'user' as const,
      loginAttempts: 4,
      lockUntil: null,
      createdAt: new Date().toISOString(),
    };

    jest.spyOn(userRepository, 'findByEmail').mockResolvedValue(mockUser);
    const updateSpy = jest.spyOn(userRepository, 'update').mockResolvedValue({
      ...mockUser,
      loginAttempts: 5,
      lockUntil: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'bad@3dnotes.com',
        password: 'wrongPassword',
      });

    expect(res.status).toBe(423); // Locked
    expect(res.body.success).toBe(false);
    expect(res.body.lockUntil).toBeDefined();
    expect(updateSpy).toHaveBeenCalledWith('user-lockout', expect.objectContaining({
      loginAttempts: 5,
      lockUntil: expect.any(String),
    }));
  });
});

describe('📝 Note Ownership & Security Checks', () => {
  const mockUserToken = jwt.sign({ userId: 'user-john', role: 'user' }, JWT_SECRET);

  it('✅ should let owners view and retrieve their own notes', async () => {
    jest.spyOn(noteRepository, 'findAllByUser').mockResolvedValue([
      {
        _id: 'note-1',
        userId: 'user-john',
        title: 'Secret Plans',
        content: 'Fly to the moon',
        color: 'clay',
        pinned: false,
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]);

    const res = await request(app)
      .get('/api/notes')
      .set('Cookie', [`token=${mockUserToken}`]);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].title).toBe('Secret Plans');
  });

  it('❌ should return 404 when trying to update a note belonging to another user', async () => {
    // findOwnedById returns null if the note belongs to another user
    jest.spyOn(noteRepository, 'updateOwned').mockResolvedValue(null);

    const res = await request(app)
      .put('/api/notes/note-other-user')
      .set('Cookie', [`token=${mockUserToken}`])
      .send({ title: 'Hacked Title' });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

describe('🛡️ Role-Based Access Control (RBAC) System', () => {
  const mockUserToken = jwt.sign({ userId: 'user-standard', role: 'user' }, JWT_SECRET);
  const mockAdminToken = jwt.sign({ userId: 'user-admin', role: 'admin' }, JWT_SECRET);

  it('❌ should block standard users from reaching administration endpoints', async () => {
    const res = await request(app)
      .get('/api/admin/users')
      .set('Cookie', [`token=${mockUserToken}`]);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Forbidden');
  });

  it('✅ should allow admins to query global user list parameters', async () => {
    jest.spyOn(userRepository, 'findAllPaginated').mockResolvedValue({
      users: [],
      totalRecords: 0,
    });

    const res = await request(app)
      .get('/api/admin/users')
      .set('Cookie', [`token=${mockAdminToken}`]);

    expect(res.status).toBe(200);
    expect(res.body.users).toBeDefined();
  });

  it('❌ should prevent admin self-deletion safety boundaries', async () => {
    const res = await request(app)
      .delete('/api/admin/users/user-admin') // same ID as logged admin
      .set('Cookie', [`token=${mockAdminToken}`]);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('You cannot incinerate your own active administrator account.');
  });
});
