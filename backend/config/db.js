import mongoose from 'mongoose';

const globalForMongoose = globalThis;

export const connectDB = async (uri) => {
  if (!uri) {
    throw new Error('MONGO_URI is required');
  }

  try {
    if (mongoose.connection.readyState === 1) {
      return mongoose.connection;
    }

    if (mongoose.connection.readyState === 2 && globalForMongoose.__mongooseConnectPromise) {
      return globalForMongoose.__mongooseConnectPromise;
    }

    globalForMongoose.__mongooseConnectPromise = mongoose.connect(uri);
    const conn = await globalForMongoose.__mongooseConnectPromise;
    console.log(`MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    globalForMongoose.__mongooseConnectPromise = null;
    console.error('MongoDB connection failed:', error.message);
    throw error;
  }
};
