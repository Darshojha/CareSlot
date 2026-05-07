import mongoose from 'mongoose';
import dns from 'node:dns';

dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

const globalForMongoose = globalThis;

const getMongoHost = (uri) => {
  try {
    return new URL(uri).hostname;
  } catch {
    return null;
  }
};

export const connectDB = async (uri) => {
  if (!uri) {
    throw new Error('MONGO_URI is required');
  }

  try {
    const host = getMongoHost(uri);
    if (host && host.endsWith('careslot.mongodb.net')) {
      throw new Error(
        'MONGO_URI points to careslot.mongodb.net, but the Atlas host should include the full cluster subdomain such as careslot.9xkyfgv.mongodb.net'
      );
    }

    if (mongoose.connection.readyState === 1) {
      return mongoose.connection;
    }

    if (mongoose.connection.readyState === 2 && globalForMongoose.__mongooseConnectPromise) {
      return globalForMongoose.__mongooseConnectPromise;
    }

    globalForMongoose.__mongooseConnectPromise = mongoose.connect(uri, {
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 15000,
      maxPoolSize: 5
    });
    const conn = await globalForMongoose.__mongooseConnectPromise;
    console.log(`MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    globalForMongoose.__mongooseConnectPromise = null;
    console.error('MongoDB connection failed:', error.message);
    throw error;
  }
};
