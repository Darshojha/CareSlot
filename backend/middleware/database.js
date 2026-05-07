import { connectDB } from '../config/db.js';

export const requireDatabase = async (req, res, next) => {
  try {
    await connectDB(process.env.MONGO_URI);
    next();
  } catch (error) {
    res.status(503).json({
      message: error.message || 'Database temporarily unavailable'
    });
  }
};
