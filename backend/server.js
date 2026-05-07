import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { connectDB } from './config/db.js';

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

connectDB(process.env.MONGO_URI).catch((error) => {
  console.warn(`MongoDB unavailable at startup: ${error.message}`);
  console.warn('API is still running; database-backed routes will return 503 until MongoDB is reachable.');
});
