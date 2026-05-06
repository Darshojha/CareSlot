import serverless from 'serverless-http';
import dotenv from 'dotenv';
dotenv.config({ path: './backend/.env' });

import app from '../backend/app.js';
import { connectDB } from '../backend/config/db.js';

await connectDB(process.env.MONGO_URI);

export default serverless(app);
