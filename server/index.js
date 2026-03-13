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
const carTripsRoutes = require("./routes/carTrip");
const hotelRoute = require("./routes/hotel");
const userRoutes = require("./routes/userRoutes");
const cruiseRoutes = require("./routes/cruiseRoutes");


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
// 🏥 HEALTH CHECK ROUTES
// ============================================

/**
 * Basic health check endpoint
 * Used by Docker healthcheck and load balancers
 */
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

/**
 * Database health check endpoint
 * Returns database connection status
 */
app.get("/health/db", (req, res) => {
  const mongoState = mongoose.connection.readyState;
  const states = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting"
  };
  const isHealthy = mongoState === 1;
  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? "healthy" : "unhealthy",
    database: states[mongoState],
    timestamp: new Date().toISOString()
  });
});

// ============================================
// 📡 API ROUTES
// ============================================

/**
 * Authentication Routes
 * POST   /api/auth/register  - Register new user
 * POST   /api/auth/login     - Login and get JWT
 * GET    /api/auth/me        - Get current user (protected)
 */
app.use("/api/auth", authRoutes);

/**
 * Category Routes
 * GET    /api/categories       - Get all (public)
 * GET    /api/categories/:id   - Get one (public)
 * POST   /api/categories       - Create (admin only)
 * PUT    /api/categories/:id   - Update (admin only)
 * DELETE /api/categories/:id   - Delete (admin only)
 */
app.use("/api/categories", categoryRoutes);

/**
 * Program Routes
 * GET    /api/programs       - Get all (public)
 * GET    /api/programs/:id   - Get one (public)
 * POST   /api/programs       - Create (admin only)
 * PUT    /api/programs/:id   - Update (admin only)
 * DELETE /api/programs/:id   - Delete (admin only)
 */
app.use("/api/programs", programRoutes);

app.use("/api/countries", countryRoutes);

/**
 * Visa Routes
 * POST   /api/visa           - Submit visa application (public)
 * GET    /api/visa           - Get all applications (admin only)
 * GET    /api/visa/:id       - Get one application (public/admin)
 * GET    /api/visa/status/:id - Track application status (public)
 * PUT    /api/visa/:id       - Update application (admin only)
 * DELETE /api/visa/:id       - Delete application (admin only)
 */

app.use("/api/hotelBooking", hotelRoute);
app.use("/api/visa", visaRoutes);
app.use("/api/flights", flightRoutes);
app.use("/api/carTrip", carTripsRoutes);
app.use("/api/users", userRoutes);
app.use("/api/cruisies", cruiseRoutes);
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
const Cruisies = require("./models/Cruisies");

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
