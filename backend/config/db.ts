import mongoose from 'mongoose';
import './env';
import logger from './logger';

let mongoConnected = false;

export function isMongoEnabled() {
  return mongoConnected && mongoose.connection.readyState === 1;
}

function getMongoConnectionHint(error: any) {
  const message = String(error?.message || '');

  if (message.includes('querySrv')) {
    return [
      'MongoDB Atlas SRV DNS lookup failed.',
      'Check your internet/DNS resolver, VPN/firewall, and Atlas cluster hostname.',
      'If this network blocks SRV lookups, use Atlas "Standard connection string" instead of mongodb+srv.',
    ].join(' ');
  }

  if (message.includes('ENOTFOUND') || message.includes('ECONNREFUSED') || message.includes('ETIMEDOUT')) {
    return 'Check MongoDB Atlas Network Access, your current IP allow-list, and local firewall/VPN settings.';
  }

  return 'Check MONGO_URI, Atlas database user credentials, and Atlas Network Access.';
}

export async function connectDB(): Promise<boolean> {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    logger.warn('No MONGO_URI provided in environment variables. Falling back to file-based JSON database (db.json).');
    return false;
  }

  try {
    mongoose.set('strictQuery', true);
    mongoose.set('bufferCommands', false);
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
    });
    mongoConnected = true;
    logger.info('Successfully connected to MongoDB Atlas database.');
    return true;
  } catch (error: any) {
    mongoConnected = false;
    logger.error(`Error connecting to MongoDB: ${error.message}.`);
    logger.error(getMongoConnectionHint(error));
    throw error;
  }
}
