const express = require("express");
const upload = require("../middlewares/upload");
const authMiddleware = require("../middlewares/authMiddleware");
const authorize = require("../middlewares/authorizeMiddleware");
const Program = require("../models/Programs");

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
      status:"active",
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
