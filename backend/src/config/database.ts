import mongoose from "mongoose";
import logger from "./logger";

export async function connectDB(): Promise<void> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI environment variable is not set.");
  }

  mongoose.set("strictQuery", true);

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10_000,
      socketTimeoutMS: 45_000,
    });
    logger.info(`✅ MongoDB connected: ${mongoose.connection.host}`);
  } catch (err) {
    logger.error("MongoDB connection error:", err);
    throw err;
  }

  mongoose.connection.on("disconnected", () =>
    logger.warn("MongoDB disconnected.")
  );
  mongoose.connection.on("reconnected", () =>
    logger.info("MongoDB reconnected.")
  );
}
