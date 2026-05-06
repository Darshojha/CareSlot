import serverless from 'serverless-http';
import dotenv from 'dotenv';
dotenv.config();

import app from '../backend/app.js';
import { connectDB } from '../backend/config/db.js';
import { ensureSeedData } from '../backend/utils/seedRuntime.js';

await connectDB(process.env.MONGO_URI);
await ensureSeedData();

export default serverless(app);
