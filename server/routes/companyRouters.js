const express = require("express");
const path = require("path");
const uploadCompany = require("../middlewares/uploadCompany");
const authMiddleware = require("../middlewares/authMiddleware");
const authorize = require("../middlewares/authorizeMiddleware");
const { validateCountry, handleValidationErrors } = require("../middlewares/validators");
const Copmany = require("../models/Company");

const router = express.Router();

/**
 * Image path normalization helper
 * ✅ Returns: /uploads/categories/filename.jpg
 * Used by API to return absolute paths that work in browser
 */
function normalizeImagePath(imagePath) {
  return `/uploads/copanies/${imagePath}`;
}



module.exports = router;