import dotenv from 'dotenv';
dotenv.config();

import { connectDB } from '../config/db.js';
import { ensureSeedData } from '../utils/seedRuntime.js';

const run = async () => {
  await connectDB(process.env.MONGO_URI);
  const result = await ensureSeedData();

  console.log(result.seeded ? 'Seed completed' : 'Seed skipped');
  process.exit(0);
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
