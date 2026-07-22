import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/intelliplant').then((mongoose) => {
      console.log(`✅ MongoDB Connected: ${mongoose.connection.host}`);
      return mongoose;
    });
  }
  
  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    throw error;
  }

  return cached.conn;
};

export default connectDB;
