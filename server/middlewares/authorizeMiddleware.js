/**
 * Authorization Middleware (Role-Based Access Control)
 * Checks if user has required role to access route
 * 
 * Usage: app.delete('/categories/:id', authMiddleware, authorize('admin'), deleteCategory)
 * 
 * Security Principle: Backend always enforces authorization - never trust frontend
 */

const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    // authMiddleware must be used before this middleware
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Check if user's role is in allowed roles
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: "Forbidden: insufficient permissions",
        requiredRole: allowedRoles,
        userRole: req.user.role
      });
    }

    next();
  };
};

module.exports = authorize;
