const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/database");
const errorHandler = require("./middleware/error.middleware");
const checkDbConnection = require("./middleware/dbCheck.middleware");

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// CORS configuration
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5000",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5000",
  // Render automatically sets RENDER_EXTERNAL_URL for the deployed service
  ...(process.env.RENDER_EXTERNAL_URL ? [process.env.RENDER_EXTERNAL_URL] : []),
  // Frontend Render Static Site URL (set manually as env var on backend)
  ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
];
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, curl, Postman)
      if (!origin) return callback(null, true);
      // Allow all localhost origins in dev
      if (allowedOrigins.includes(origin)) return callback(null, true);
      // In production, allow all HTTPS origins (frontend is on separate domain)
      if (process.env.NODE_ENV === "production") return callback(null, true);
      callback(null, true); // Allow all during development
    },
    credentials: true,
  })
);

// Serve uploads statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Root Endpoint — only active in development (production serves React app instead)
if (process.env.NODE_ENV !== "production") {
  app.get("/", (req, res) => {
    res.json({
      success: true,
      message: "PrepMind AI API is running",
      environment: process.env.NODE_ENV || "development",
    });
  });
}

// Health Check API Endpoint
app.get("/api/health", (req, res) => {
  const isDbConnected = require("mongoose").connection.readyState === 1;
  res.json({
    success: true,
    message: "PrepMind AI backend is healthy",
    database: isDbConnected ? "connected" : "disconnected",
  });
});

// API Routes with DB Guard
app.use("/api/auth", checkDbConnection, require("./routes/auth.routes"));
app.use("/api/resume", checkDbConnection, require("./routes/resume.routes"));
app.use("/api/interviews", checkDbConnection, require("./routes/interview.routes"));

// Production Static Serving
if (process.env.NODE_ENV === "production") {
  const distPath = path.join(__dirname, "../frontend/dist");
  app.use(express.static(distPath));

  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) {
      return next();
    }
    res.sendFile(path.join(distPath, "index.html"));
  });
}

// Error Handler Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT} in ${process.env.NODE_ENV || "development"} mode`);
});
