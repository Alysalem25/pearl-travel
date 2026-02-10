/**
 * PRODUCTION-READY SECURITY ARCHITECTURE
 * Pearl Travel Backend - Express.js + MongoDB + JWT
 * 
 * Security Features:
 * - Helmet.js for HTTP headers protection
 * - CORS properly configured
 * - JWT-based authentication with 7-day expiry
 * - Role-based access control (RBAC)
 * - Input validation and sanitization
 * - Password hashing with bcrypt
 * - Centralized error handling (no stack leaks)
 * - Protected routes for admin operations
 */
// const authRoutes = require("./routes/auth");

const express = require("express");
const mongoose = require("mongoose");
const helmet = require("helmet");
const cors = require("cors");
const path = require("path"); 
require("dotenv").config();
// app.use("/auth", authRoutes);

const app = express();

// ============================================
// 🔐 SECURITY MIDDLEWARE
// ============================================

// Helmet.js - Set security HTTP headers
// Protects against XSS, Clickjacking, MIME-type sniffing, etc.
app.use(helmet());

// Parse JSON request bodies
app.use(express.json({ limit: "10mb" }));

// CORS Configuration - Restrict to frontend origin
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Serve uploaded images statically
// Images are public resources
// 
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"), {
    setHeaders: (res) => {
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    },
  })
);

// ============================================
// 📦 ROUTES IMPORTS
// ============================================

const authRoutes = require("./routes/authRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const programRoutes = require("./routes/programRoutes");

// ============================================
// 🗄️ DATABASE CONNECTION
// ============================================

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✓ MongoDB Connected"))
  .catch(err => {
    console.error("✗ MongoDB Connection Error:", err.message);
    process.exit(1);
  });

// ============================================
// 📡 API ROUTES
// ============================================

/**
 * Authentication Routes
 * POST   /auth/register  - Register new user
 * POST   /auth/login     - Login and get JWT
 * GET    /auth/me        - Get current user (protected)
 */
app.use("/auth", authRoutes);

/**
 * Category Routes
 * GET    /categories       - Get all (public)
 * GET    /categories/:id   - Get one (public)
 * POST   /categories       - Create (admin only)
 * PUT    /categories/:id   - Update (admin only)
 * DELETE /categories/:id   - Delete (admin only)
 */
app.use("/categories", categoryRoutes);

/**
 * Program Routes
 * GET    /programs       - Get all (public)
 * GET    /programs/:id   - Get one (public)
 * POST   /programs       - Create (admin only)
 * PUT    /programs/:id   - Update (admin only)
 * DELETE /programs/:id   - Delete (admin only)
 */
app.use("/programs", programRoutes);

// ============================================
// 📊 STATS ENDPOINT (PUBLIC)
// ============================================

const Admin = require("./models/Users");
const Program = require("./models/Programs");
const Category = require("./models/Category");

app.get("/stats", async (req, res, next) => {
  try {
    const [
      userCount,
      activePrograms,
      inactivePrograms,
      categoriesCount,
      egyptPrograms,
      internationalPrograms
    ] = await Promise.all([
      Admin.countDocuments(),
      Program.countDocuments({ status: "active" }),
      Program.countDocuments({ status: "inactive" }),
      Category.countDocuments(),
      Program.countDocuments({ country: "Egypt" }),
      Program.countDocuments({ country: "Albania" })
    ]);

    res.json({
      stats: {
        userCount,
        activePrograms,
        totalPrograms: activePrograms + inactivePrograms,
        categoriesCount,
        egyptPrograms,
        internationalPrograms
      }
    });
  } catch (err) {
    next(err);
  }
});

// ============================================
// ❌ ERROR HANDLING
// ============================================

const { errorHandler, notFoundHandler } = require("./middlewares/errorHandler");

// 404 handler - must be before error handler
app.use(notFoundHandler);

// Centralized error handler - must be last
app.use(errorHandler);

// ============================================
// 🚀 SERVER START
// ============================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║  Pearl Travel Backend                   ║
║  🔐 Security-Hardened Architecture      ║
║  Port: ${PORT}                            ║
║  Env: ${process.env.NODE_ENV || "development"}               ║
╚════════════════════════════════════════╝
  `);
});

module.exports = app;
