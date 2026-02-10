const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/Users");
const { validateRegister, validateLogin, handleValidationErrors } = require("../middlewares/validators");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

/**
 * POST /auth/register
 * Register a new user
 * 
 * Security:
 * - Password is validated for strength
 * - Email is normalized and checked for uniqueness
 * - Password is hashed via User model pre-save hook
 * - No sensitive data in response
 */
router.post(
  "/register",
  validateRegister,
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const { name, email, password, number, role = "admin" } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          error: "Email already registered"
        });
      }

      // Create new user (password hashed in pre-save hook)
      const user = new User({
        name,
        email,
        password,
        number,
        role
      });

      await user.save();

      // Generate JWT
      const token = jwt.sign(
        {
          id: user._id,
          role: user.role
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || "7d" }
      );

      res.status(201).json({
        message: "User registered successfully",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } catch (err) {
      next(err); // ✅ مهم جدًا
    }
  }
);

/**
 * POST /auth/login
 * Authenticate user and return JWT
 * 
 * Security:
 * - Password comparison uses bcrypt
 * - JWT expires in 7 days
 * - No sensitive data in response
 */
router.post("/login", validateLogin, handleValidationErrors, async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user and explicitly select password field (normally excluded)
    const user = await User.findOne({ email }).select("+password");

    // Validate email exists
    if (!user) {
      return res.status(401).json({
        error: "Invalid email or password"
      });
    }

    // Compare passwords using bcrypt
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        error: "Invalid email or password"
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || "7d" }
    );

    // Return success without exposing password
    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /auth/me
 * Get current user info (protected route)
 * Requires valid JWT in Authorization header
 */
router.get("/me", authMiddleware, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        number: user.number
      }
    });
  } catch (err) {
    next(err);
  }
});

// get all users (admin only)
// GET /auth/users
router.get("/users", authMiddleware, async (req, res, next) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied" });
    }

    const users = await User.find().select("-password");
    res.json({ users });
  } catch (err) {
    next(err);
  }
});

// delete user (admin only)
router.delete("/deleteUser/:id", authMiddleware, async (req, res, next) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied" });
    }

    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;