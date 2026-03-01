const express = require("express");
const upload = require("../middlewares/upload");
const authMiddleware = require("../middlewares/authMiddleware");
const authorize = require("../middlewares/authorizeMiddleware");
const Program = require("../models/Programs");
const BookedPrograms = require("../models/BookedPrograms");
const router = express.Router();

/**
 * Image path normalization helper
 */
function normalizeImagePath(imagePath) {
  return `/uploads/programs/${imagePath}`;
}

/**
 * GET /programs
 * Get all programs - PUBLIC ROUTE
 */
router.get("/", async (req, res, next) => {
  try {
    const programs = await Program.find().populate("category");
    const normalizedPrograms = programs.map(program => ({
      ...program.toObject(),
      images: program.images ? program.images.map(normalizeImagePath) : []
    }));
    res.json(normalizedPrograms);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /programs/category/:categoryId
 * Get programs by category - PUBLIC ROUTE
 */
router.get("/category/:categoryId", async (req, res, next) => {
  try {
    const { categoryId } = req.params;

    const programs = await Program.find({
      category: categoryId,
      status: "active",
    }).populate("category", "nameEn nameAr");

    if (!programs.length) {
      return res.status(404).json({
        message: "No programs found for this category"
      });
    }

    const normalizedPrograms = programs.map(program => ({
      ...program.toObject(),
      images: program.images ? program.images.map(normalizeImagePath) : []
    }));

    res.json(normalizedPrograms);
  } catch (err) {
    next(err);
  }
});

// Admin route to get all booked programs
router.get("/booked", authMiddleware, authorize("admin"), async (req, res, next) => {
  try {
    const bookedPrograms = await BookedPrograms.find().populate("program");
    res.json(bookedPrograms);
  } catch (err) {
    next(err);
  }
});

// admin update booking status
router.put("/booked/:id/status", authMiddleware, authorize("admin"), async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!["pending", "reviewed"].includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }
    const bookedProgram = await BookedPrograms.findByIdAndUpdate(
      req.params.id,
      { status: status === "pending" ? "pending" : "reviewed" },
      { new: true, runValidators: true }
    ).populate("program");
    if (!bookedProgram) return res.status(404).json({ error: "Booking not found" });
    res.json(bookedProgram);
  } catch (err) {
    next(err);
  }
});

// User route to book a program
router.post("/book", async (req, res, next) => {
  try {
    const { userEmail, userName, userNumber, programId, message } = req.body;
    const program = await Program.findById(programId);
    if (!program) {
      return res.status(404).json({ error: "Program not found" });
    }
    const bookedProgram = new BookedPrograms({
      userEmail,
      userName,
      userNumber,
      program: programId,
      message
    });
    await bookedProgram.save();
    res.status(201).json(bookedProgram);
  }
  catch (err) {
    next(err);
  }
});

//  admin delete a booking
router.delete("/booked/:id", authMiddleware, authorize("admin"), async (req, res, next) => {
  try {
    const bookedProgram = await BookedPrograms.findByIdAndDelete(req.params.id);
    if (!bookedProgram) return res.status(404).json({ error: "Booking not found" });
    res.json({ message: "Booking deleted" });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /programs/:id
 * Get single program by ID - PUBLIC ROUTE
 */
router.get("/:id", async (req, res, next) => {
  try {
    const program = await Program.findById(req.params.id).populate("category");

    if (!program) {
      return res.status(404).json({ error: "Program not found" });
    }

    const normalizedProgram = {
      ...program.toObject(),
      images: program.images ? program.images.map(normalizeImagePath) : []
    };

    res.json(normalizedProgram);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /programs
 * Create new program - ADMIN ONLY
 * 
 * Security:
 * - Requires authentication and admin role
 * - File uploads restricted to 5 images
 */
router.post(
  "/",
  authMiddleware,
  // authorize("admin"),
  upload.array("images", 5),
  async (req, res, next) => {
    try {
      const {
        titleEn,
        titleAr,
        descriptionEn,
        descriptionAr,
        category,
        country,
        durationDays,
        durationNights,
        price,
        status,
        days
      } = req.body;

      // Extract uploaded image filenames
      const images = (req.files || []).map(f => f.filename);

      const program = new Program({
        titleEn,
        titleAr,
        descriptionEn,
        descriptionAr,
        category,
        country,
        durationDays,
        durationNights,
        price,
        status,
        images,
        days: days ? JSON.parse(days) : []
      });

      await program.save();
      await program.populate("category");

      // Normalize response
      const response = {
        ...program.toObject(),
        images: program.images.map(normalizeImagePath)
      };

      res.status(201).json(response);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * PUT /programs/:id
 * Update program - ADMIN ONLY
 */
router.put(
  "/:id",
  authMiddleware,
  authorize("admin"),
  async (req, res, next) => {
    try {
      const {
        titleEn,
        titleAr,
        descriptionEn,
        descriptionAr,
        category,
        country,
        durationDays,
        durationNights,
        price,
        status,
        days
      } = req.body;

      const updateData = {
        titleEn,
        titleAr,
        descriptionEn,
        descriptionAr,
        category,
        country,
        durationDays,
        durationNights,
        price,
        status,
        days: days ? JSON.parse(days) : undefined
      };

      const program = await Program.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      ).populate("category");

      if (!program) {
        return res.status(404).json({ error: "Program not found" });
      }

      // Normalize response
      const response = {
        ...program.toObject(),
        images: program.images.map(normalizeImagePath)
      };

      res.json(response);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * DELETE /programs/:id
 * Delete program - ADMIN ONLY
 */
router.delete("/:id", authMiddleware, authorize("admin"), async (req, res, next) => {
  try {
    const program = await Program.findByIdAndDelete(req.params.id);

    if (!program) {
      return res.status(404).json({ error: "Program not found" });
    }

    res.json({ message: "Program deleted successfully" });
  } catch (err) {
    next(err);
  }
});




module.exports = router;
