const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/ai-interview-prep";
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of buffering indefinitely
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Warning: Could not connect to database at ${process.env.MONGO_URI || "127.0.0.1:27017"}`);
    console.error(`Error details: ${error.message}`);
    if (process.env.NODE_ENV === "production") {
      process.exit(1);
    }
  }
};

module.exports = connectDB;
