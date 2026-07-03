import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { userRepository, UserData } from '../repositories/userRepository';
import logger from '../config/logger';

const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes
const MAX_FAILED_ATTEMPTS = 5;

function getJwtSecret() {
  if (process.env.JWT_SECRET) {
    return process.env.JWT_SECRET;
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET must be configured in production.');
  }

  return 'dev-only-jwt-secret';
}

export interface AuthResult {
  success: boolean;
  user?: {
    _id: string;
    email: string;
    name: string;
    role: 'user' | 'admin';
  };
  token?: string;
  error?: string;
  lockUntil?: string | null;
  statusCode: number;
}

export const authService = {
  async register(name: string, email: string, password: string): Promise<AuthResult> {
    const trimmedEmail = email.trim().toLowerCase();
    
    // Check if email already exists
    const existingUser = await userRepository.findByEmail(trimmedEmail);
    if (existingUser) {
      logger.warn(`Registration failed: Email ${trimmedEmail} is already registered.`);
      return {
        success: false,
        error: 'Email is already registered',
        statusCode: 409,
      };
    }

    // Hash password (10 salt rounds)
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user. Ignore client-provided role (always 'user')
    const newUser = await userRepository.create({
      name: name.trim(),
      email: trimmedEmail,
      passwordHash,
      role: 'user',
    });

    logger.info(`User registered successfully: ${newUser.email} (${newUser._id})`);

    // Sign JWT (expires in 1 hour)
    const token = jwt.sign(
      { userId: newUser._id, role: newUser.role },
      getJwtSecret(),
      { expiresIn: '1h' }
    );

    return {
      success: true,
      user: {
        _id: newUser._id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
      },
      token,
      statusCode: 201,
    };
  },

  async login(email: string, password: string): Promise<AuthResult> {
    const trimmedEmail = email.trim().toLowerCase();
    const user = await userRepository.findByEmail(trimmedEmail);

    if (!user) {
      logger.warn(`Login attempt failed: Email ${trimmedEmail} does not exist.`);
      return {
        success: false,
        error: 'Invalid credentials. Please try again.',
        statusCode: 401,
      };
    }

    // Check if account is locked
    if (user.lockUntil) {
      const lockTime = new Date(user.lockUntil).getTime();
      const now = Date.now();
      if (now < lockTime) {
        logger.warn(`Login attempt blocked: Account ${trimmedEmail} is currently locked.`);
        return {
          success: false,
          error: 'Account is temporarily locked due to too many failed attempts.',
          lockUntil: user.lockUntil,
          statusCode: 423,
        };
      } else {
        // Lock has expired; reset attempts & clear lock
        await userRepository.update(user._id, {
          loginAttempts: 0,
          lockUntil: null,
        });
        logger.info(`Account lockout expired for user: ${trimmedEmail}. Lock has been reset.`);
      }
    }

    // Compare passwords
    const isPasswordMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordMatch) {
      const updatedAttempts = user.loginAttempts + 1;
      let lockUntilStr: string | null = null;
      let errorMsg = 'Invalid credentials. Please try again.';
      let statusCode = 401;

      if (updatedAttempts >= MAX_FAILED_ATTEMPTS) {
        lockUntilStr = new Date(Date.now() + LOCKOUT_DURATION_MS).toISOString();
        errorMsg = 'Too many failed login attempts. Your account has been temporarily locked.';
        statusCode = 423;
        
        await userRepository.update(user._id, {
          loginAttempts: updatedAttempts,
          lockUntil: lockUntilStr,
        });

        logger.warn(`Account locked out: User ${trimmedEmail} has exceeded max attempts. Locked for 15 minutes.`);
      } else {
        await userRepository.update(user._id, {
          loginAttempts: updatedAttempts,
        });
        logger.warn(`Failed login attempt (${updatedAttempts}/${MAX_FAILED_ATTEMPTS}) for user: ${trimmedEmail}`);
      }

      return {
        success: false,
        error: errorMsg,
        lockUntil: lockUntilStr,
        statusCode,
      };
    }

    // Login successful: reset failed attempts
    if (user.loginAttempts > 0 || user.lockUntil) {
      await userRepository.update(user._id, {
        loginAttempts: 0,
        lockUntil: null,
      });
    }

    logger.info(`User logged in successfully: ${user.email} (${user._id})`);

    // Sign JWT (expires in 1 hour)
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      getJwtSecret(),
      { expiresIn: '1h' }
    );

    return {
      success: true,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
      statusCode: 200,
    };
  },

  async getMe(userId: string): Promise<UserData | null> {
    return await userRepository.findById(userId);
  }
};
