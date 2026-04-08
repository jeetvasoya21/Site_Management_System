import mongoose from "mongoose";
import env from "../config/env.js";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(env.mongoUri, {
      autoIndex: env.nodeEnv !== "production",
    });
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
