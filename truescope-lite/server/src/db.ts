import mongoose from 'mongoose';
import { env } from './env';

export async function connectDB() {
 
  if (!env.MONGO_URI) {
	throw new Error('MONGO_URI is not defined in environment');
  }
  await mongoose.connect(env.MONGO_URI);
}