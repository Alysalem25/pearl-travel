const express = require("express");
const path = require("path");
const uploadUser = require("../middlewares/uploadUser");
const authMiddleware = require("../middlewares/authMiddleware");
const authorize = require("../middlewares/authorizeMiddleware");
const { validateRegister, validateLogin, handleValidationErrors } = require("../middlewares/validators");
const User = require("../models/Users");
const jwt = require("jsonwebtoken");

const router = express.Router();


function normalizeImagePath(filename) {
  return `/uploads/users/${filename}`;
}

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
  // Run multer first to populate req.body and req.files for validation
  uploadUser.array("images", 1),
  validateRegister,
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const { name, email, password, number, role, inTeam } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          error: "Email already registered"
        });
      }

      const images = (req.files || []).map(f => f.filename);
      const user = new User({
        name,
        email,
        password,
        number,
        role,
        inTeam,
        images
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
      // console.log("Registered user:", {
      //   id: user._id,
      //   name: user.name,
      //   email:user.email,
      //   image: user.image ? normalizeImagePath(user.image) : null
      // });
      
      const response = {
        ...user.toObject(),
        images: user.images.map(normalizeImagePath)
      };

      console.log(response);

      res.status(201).json({
        message: "User registered successfully",
        token,
        user: response
      });
    } catch (err) {
      next(err);
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

    const users = await User.find({ _id: { $ne: req.user.id } }).select("-password");
    const normalizedUsers = users.map(user => ({
      ...user.toObject(),
      images: user.images ? user.images.map(normalizeImagePath) : []
    }));
    res.json({ users: normalizedUsers });
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

// get users in team for all
router.get("/team", authMiddleware, async (req, res, next) => {
  try {
    const teamMembers = await User.find({ inTeam: true }).select("-password");
    const normalizedUsers = teamMembers.map(user => ({
      ...user.toObject(),
      images: user.images ? user.images.map(normalizeImagePath) : []
    }));
    res.json({ team: normalizedUsers });
  } catch (err) {
    next(err);
  }
});

module.exports = router;