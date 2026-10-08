const mongoose = require("mongoose");

/**
 * Middleware that checks if MongoDB connection is ready (readyState === 1).
 * If disconnected, returns immediate 503 error instead of buffering 10,000ms.
 */
const checkDbConnection = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: "Database Connection Error: Cannot connect to MongoDB. Please ensure your local MongoDB service (mongod) is running or update MONGO_URI in backend/.env to a valid MongoDB Atlas URI.",
    });
  }
  next();
};

module.exports = checkDbConnection;
