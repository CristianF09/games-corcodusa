import mongoose from "mongoose";

if (!process.env.MONGODB_URI) {
  throw new Error(
    "MONGODB_URI must be set. Did you forget to provision a database?",
  );
}

mongoose.set("strictQuery", true);

let connectPromise: Promise<typeof mongoose> | null = null;

/**
 * Opens the MongoDB connection. Safe to call more than once — later calls
 * reuse the same in-flight/established connection instead of opening a new
 * one. Call this once at server startup, before accepting traffic.
 */
export function connectDB(): Promise<typeof mongoose> {
  if (!connectPromise) {
    connectPromise = mongoose.connect(process.env.MONGODB_URI!);
  }
  return connectPromise;
}

export * from "./schema";
