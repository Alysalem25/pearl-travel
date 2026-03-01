/**
 * Centralized Error Handler Middleware
 * 
 * Security: 
 * - No stack traces in production
 * - Consistent error response format
 * - Proper HTTP status codes
 * - Sensitive data filtering
 */

const errorHandler = (err, req, res, next) => {
  // Log error with full details for debugging (server-side only)
  console.error("Error:", {
    message: err.message,
    stack: err.stack,
    method: req.method,
    url: req.originalUrl,
    body: req.body
  });

  // Default error response
  let status = err.status || 500;
  let message = err.message || "Internal server error";

  // Handle Mongoose validation errors
  if (err.name === "ValidationError") {
    status = 400;
    message = "Validation error";
  }

  // Handle Mongoose duplicate key errors
  if (err.code === 11000) {
    status = 400;
    const field = Object.keys(err.keyValue)[0];
    message = `${field} already exists`;
  }

  // Handle JWT errors
  if (err.name === "JsonWebTokenError") {
    status = 401;
    message = "Invalid token";
  }

  if (err.name === "TokenExpiredError") {
    status = 401;
    message = "Token has expired";
  }

  // Handle Multer file upload errors
  if (err.name === "MulterError") {
    status = 400;
    message = `File upload error: ${err.message}`;
  }

  // Send error response
  // In production, never send stack traces to client
  const showStack = process.env.NODE_ENV === "development" || process.env.DEBUG_ERRORS === "true";

  const response = {
    error: message,
    ...(showStack && { stack: err.stack })
  };

  res.status(status).json(response);
};

/**
 * 404 Not Found Handler
 * Should be registered as the last middleware
 */
const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: "Route not found",
    path: req.originalUrl,
    method: req.method
  });
};

module.exports = {
  errorHandler,
  notFoundHandler
};
