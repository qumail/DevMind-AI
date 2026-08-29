import mongoose from "mongoose";
import { env } from "../config/env";

export const connectMongoDB = async (): Promise<void> => {
  try {
    await mongoose.connect(env.mongodb.uri);

    console.log("✓ MongoDB connected", env.mongodb.uri);
  } catch (error) {
    console.error("✗ MongoDB connection failed");

    throw error;
  }
};

export const disconnectMongoDB = async (): Promise<void> => {
  await mongoose.disconnect();

  console.log("MongoDB disconnected");
};