import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!global._mongoose) {
  global._mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (global._mongoose.conn) {
    return global._mongoose.conn;
  }

  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not set.");
  }

  if (!global._mongoose.promise) {
    global._mongoose.promise = mongoose.connect(MONGODB_URI, {
      maxPoolSize: 10,
      minPoolSize: 1,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 20000,
    });
  }

  global._mongoose.conn = await global._mongoose.promise;
  return global._mongoose.conn;
}
