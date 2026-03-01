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
const countryRoutes = require("./routes/countryRoutes");
const visaRoutes = require("./routes/visaRoutes");
const flightRoutes = require("./routes/flightRoutes");
const carTripsRoutes = require("./routes/carTrip")
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

app.use("/countries", countryRoutes);

/**
 * Visa Routes
 * POST   /visa           - Submit visa application (public)
 * GET    /visa           - Get all applications (admin only)
 * GET    /visa/:id       - Get one application (public/admin)
 * GET    /visa/status/:id - Track application status (public)
 * PUT    /visa/:id       - Update application (admin only)
 * DELETE /visa/:id       - Delete application (admin only)
 */
app.use("/visa", visaRoutes);
app.use("/flights", flightRoutes);
app.use("/carTrip", carTripsRoutes)
// ============================================
// 📊 STATS ENDPOINT (PUBLIC)
// ============================================

const Admin = require("./models/Users");
const Program = require("./models/Programs");
const Category = require("./models/Category");
const Visa = require("./models/Visa");
const Flights = require("./models/Flights");
const BookedPrograms = require("./models/BookedPrograms");
const CarTrips = require("./models/CarsTrips")
app.get("/stats", async (req, res, next) => {
  try {
    const [
      userCount,
      activePrograms,
      inactivePrograms,
      categoriesCount,
      egyptPrograms,
      internationalPrograms,
      visaApplications,
      visaPending,
      visaReviewed,
      flightCount,
      reviewedFlights,
      pendingFlights,
      bookedCount,
      pendingBookings,
      reviewedBookings

    ] = await Promise.all([
      Admin.countDocuments(),
      Program.countDocuments({ status: "active" }),
      Program.countDocuments({ status: "inactive" }),
      Category.countDocuments(),
      Program.countDocuments({ country: "Egypt" }),
      Program.countDocuments({ country: "Albania" }),
      // Visa stats
      Visa.countDocuments(),
      Visa.countDocuments({ status: "pending" }),
      Visa.countDocuments({ status: "reviewed" }),
      // Flight stats
      Flights.countDocuments(),
      Flights.countDocuments({ status: "reviewed" }),
      Flights.countDocuments({ status: "pending" }),
      // Booked programs stats
      BookedPrograms.countDocuments(),
      BookedPrograms.countDocuments({ status: "pending" }),
      BookedPrograms.countDocuments({ status: "reviewed" })

    ]);

    res.json({
      stats: {
        userCount,
        activePrograms,
        totalPrograms: activePrograms + inactivePrograms,
        categoriesCount,
        egyptPrograms,
        internationalPrograms,
        visaApplications,
        visaPending,
        visaReviewed,
        flightCount,
        reviewedFlights,
        pendingFlights,
        bookedCount,
        pendingBookings,
        reviewedBookings

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
