const mongoose = require("mongoose");

// Increase buffering timeout to 30s to prevent premature query drops during startup/cold starts
mongoose.set("bufferTimeoutMS", 30000);

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error("MONGO_URI is not defined in environment variables");
    }

    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      maxPoolSize: 50,
      minPoolSize: 5,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error("❌ MongoDB Connection Failed:", error.message);
    throw error;
  }
};

mongoose.connection.on("disconnected", () => {
  console.warn("⚠️ MongoDB Disconnected. Attempting reconnection...");
});

mongoose.connection.on("reconnected", () => {
  console.log("🔄 MongoDB Reconnected successfully.");
});

mongoose.connection.on("error", (err) => {
  console.error("❌ MongoDB Connection Error:", err.message);
});

module.exports = connectDB;