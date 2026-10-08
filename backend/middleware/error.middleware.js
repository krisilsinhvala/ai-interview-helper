const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || "Internal Server Error";

  // Parse raw JSON API errors if thrown as string
  if (typeof message === "string" && message.startsWith("{")) {
    try {
      const parsed = JSON.parse(message);
      if (parsed.error && parsed.error.message) {
        message = parsed.error.message;
      }
    } catch (e) {}
  }

  // Handle 503 / capacity errors
  if (message.includes("503") || message.includes("UNAVAILABLE") || message.includes("high demand") || message.includes("capacity")) {
    statusCode = 503;
    message = "The AI service is currently experiencing high demand. Automatic retry attempt in progress — please try again in a few seconds.";
  }

  if (err.name === "CastError") {
    statusCode = 404;
    message = "Resource not found";
  }

  if (err.code === 11000) {
    statusCode = 400;
    message = "Duplicate field value entered";
  }

  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors).map((val) => val.message).join(", ");
  }

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};

module.exports = errorHandler;
