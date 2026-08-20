import { env } from "../config/env.js";

export const errorHandler = (err, req, res, next) => {
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.details ? { details: err.details } : {}),
    });
  }

  console.error("Unhandled error:", err);

  if (env.nodeEnv === "production") {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
  return res.status(500).json({
    success: false,
    message: err.message || "Internal server error",
  });
};

export const notFoundHandler = (req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
};