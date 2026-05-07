import mongoose from 'mongoose';

const globalForMongoose = globalThis;

const getTimeout = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const withTimeout = (promise, ms, label) =>
  Promise.race([
    promise,
    new Promise((_, reject) => {
      const timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
      timer.unref?.();
    })
  ]);

const getMongoHost = (uri) => {
  try {
    return new URL(uri).hostname;
  } catch {
    return null;
  }
};

export const connectDB = async (uri, options = {}) => {
  if (!uri) {
    throw new Error('MONGO_URI is required');
  }

  const timeoutMS = getTimeout(options.timeoutMS ?? process.env.MONGO_CONNECT_TIMEOUT_MS, 5000);
  const host = getMongoHost(uri);
  if (host && host.endsWith('careslot.mongodb.net')) {
    throw new Error(
      'MONGO_URI points to careslot.mongodb.net, but the Atlas host should include the full cluster subdomain such as careslot.9xkyfgv.mongodb.net'
    );
  }

  try {
    if (mongoose.connection.readyState === 1) {
      return mongoose.connection;
    }

    if (mongoose.connection.readyState === 2 && globalForMongoose.__mongooseConnectPromise) {
      return globalForMongoose.__mongooseConnectPromise;
    }

    const connectPromise = mongoose.connect(uri, {
      serverSelectionTimeoutMS: timeoutMS,
      connectTimeoutMS: timeoutMS,
      socketTimeoutMS: Math.max(timeoutMS * 2, 10000),
      maxPoolSize: 5,
      family: 4
    });

    globalForMongoose.__mongooseConnectPromise = withTimeout(connectPromise, timeoutMS + 1000, 'Mongo connect');
    const conn = await globalForMongoose.__mongooseConnectPromise;
    console.log(`MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    globalForMongoose.__mongooseConnectPromise = null;
    console.error('MongoDB connection failed:', error.message);
    throw error;
  }
};
