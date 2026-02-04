import mongoose from "mongoose";

export default async function connectDB() {
  try {
    if (!process.env.MONGODB_URI) {
      console.log("⚠️ MONGODB_URI missing (server runs, DB won’t connect).");
      return;
    }
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  }
}
