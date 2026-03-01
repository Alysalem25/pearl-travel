const express = require("express");
const path = require("path");
const uploadCategory = require("../middlewares/uploadCategory");
const authMiddleware = require("../middlewares/authMiddleware");
const authorize = require("../middlewares/authorizeMiddleware");
const { validateCategory, handleValidationErrors } = require("../middlewares/validators");
const Category = require("../models/Category");

const router = express.Router();

/**
 * Image path normalization helper
 * ✅ Returns: /uploads/categories/filename.jpg
 * Used by API to return absolute paths that work in browser
 */
function normalizeImagePath(imagePath) {
  return `/uploads/categories/${imagePath}`; 
}

/**
 * GET /categories
 * Get all categories - PUBLIC ROUTE
 */
router.get("/", async (req, res, next) => {
  try {
    const categories = await Category.find();
    const normalizedCategories = categories.map(category => ({
      ...category.toObject(),
      images: category.images ? category.images.map(normalizeImagePath) : []
    }));
    res.json(normalizedCategories);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /categories/country/:country
 * Get categories by country - PUBLIC ROUTE
 * Must be defined BEFORE /:id to avoid route collision
 */
router.get("/country/:country", async (req, res, next) => {
  try {
    const { country } = req.params;

    const categories = await Category.find({
      country,
      isActive: true
    });

    if (!categories || categories.length === 0) {
      return res.status(404).json({ error: "No categories found for this country" });
    }

    const normalizedCategories = categories.map(category => ({
      ...category.toObject(),
      images: category.images ? category.images.map(normalizeImagePath) : []
    }));

    res.json(normalizedCategories);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /categories/:id
 * Get single category by ID - PUBLIC ROUTE
 */
router.get("/:id", async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    const normalizedCategory = {
      ...category.toObject(),
      images: category.images ? category.images.map(normalizeImagePath) : []
    };

    res.json(normalizedCategory);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /categories
 * Create new category - ADMIN ONLY
 * 
 * Security:
 * - Requires authentication (authMiddleware)
 * - Requires admin role (authorize)
 * - Validates input (validateCategory)
 * - File uploads restricted to 1 image
 */
router.post(
  "/",
  authMiddleware,
  authorize("admin"),
  uploadCategory.array("images", 1),
  validateCategory,
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const {
        nameEn,
        nameAr,
        type,
        descriptionEn,
        descriptionAr,
        country,
        isActive
      } = req.body;

      const images = (req.files || []).map(f => f.filename);

      const category = new Category({
        nameEn,
        nameAr,
        type,
        descriptionEn,
        descriptionAr,
        country,
        images,
        isActive
      });

      await category.save();

      const response = {
        ...category.toObject(),
        images: category.images.map(normalizeImagePath)
      };

      res.status(201).json(response);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * PUT /categories/:id
 * Update category - ADMIN ONLY
 */
router.put(
  "/:id",
  authMiddleware,
  authorize("admin"),
  validateCategory,
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const { nameEn, nameAr, type, descriptionEn, descriptionAr, country, isActive } = req.body;

      const category = await Category.findByIdAndUpdate(
        req.params.id,
        { nameEn, nameAr, type, descriptionEn, descriptionAr, country, isActive },
        { new: true, runValidators: true }
      );

      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }

      const response = {
        ...category.toObject(),
        images: category.images ? category.images.map(normalizeImagePath) : []
      };

      res.json(response);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * DELETE /categories/:id
 * Delete category - ADMIN ONLY
 */
router.delete("/:id", authMiddleware, authorize("admin"), async (req, res, next) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    res.json({ message: "Category deleted successfully" });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /categories/:id/images
 * Add image to existing category - ADMIN ONLY
 */
router.post(
  "/:id/images",
  authMiddleware,
  authorize("admin"),
  uploadCategory.array("images", 1),
  async (req, res, next) => {
    try {
      const category = await Category.findById(req.params.id);

      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }

      const images = (req.files || []).map(f => f.filename);
      category.images.push(...images);

      await category.save();

      const response = {
        ...category.toObject(),
        images: category.images ? category.images.map(normalizeImagePath) : []
      };

      res.json(response);
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;