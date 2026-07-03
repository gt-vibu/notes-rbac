import bcrypt from 'bcryptjs';
import { userRepository } from '../repositories/userRepository';
import logger from '../config/logger';

export async function seedDefaultAdmin() {
  try {
    const adminCount = await userRepository.countAdmins();
    if (adminCount > 0) {
      logger.info('Database already has administrative accounts. Skipping default admin seeding.');
      return;
    }

    const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const name = process.env.ADMIN_NAME?.trim() || 'Admin Workspace';
    const password = process.env.ADMIN_PASSWORD;

    if (!email || !password) {
      logger.warn('No administrative accounts found, but ADMIN_EMAIL and ADMIN_PASSWORD are not both configured. Skipping admin seeding.');
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await userRepository.create({
      email,
      name,
      passwordHash,
      role: 'admin',
    });

    logger.info(`Default admin seeded successfully for ${email}. Password was provided by environment and was not logged.`);
  } catch (err: any) {
    logger.error(`Error during administrative seeding: ${err.message}`);
  }
}
