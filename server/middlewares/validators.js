const { body, validationResult } = require("express-validator");
const CountryModel = require("../models/Country");

/**
 * Validation Rules using express-validator
 * 
 * Security Benefits:
 * - Input sanitization (trim, normalizeEmail)
 * - Type validation
 * - Format validation
 * - Length constraints to prevent abuse
 */

// Register validation
const validateRegister = [
  body("name")
    .trim()
    .notEmpty().withMessage("Name is required")
    .isLength({ min: 2, max: 100 }).withMessage("Name must be 2-100 characters"),
  
  body("email")
    .trim()
    .normalizeEmail()
    .isEmail().withMessage("Email must be valid")
    .isLength({ max: 255 }).withMessage("Email is too long"),
  
  body("password")
    .notEmpty().withMessage("Password is required")
    .isLength({ min: 8 }).withMessage("Password must be at least 8 characters")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage("Password must contain uppercase, lowercase, and number"),
  
  body("number")
    .trim()
    .notEmpty().withMessage("Phone number is required")
    .matches(/^[0-9+\-\s()]+$/).withMessage("Phone number is invalid"),
  
  body("role")
    .optional()
    .isIn(['admin', 'user']).withMessage("Role must be 'admin' or 'user'")
];

// Login validation
const validateLogin = [
  body("email")
    .trim()
    .normalizeEmail()
    .isEmail().withMessage("Email must be valid"),
  
  body("password")
    .notEmpty().withMessage("Password is required")
    .isLength({ min: 8 }).withMessage("Password must be at least 8 characters")
];

// Category creation validation
const validateCategory = [
  body("nameEn")
    .trim()
    .notEmpty().withMessage("English name is required")
    .isLength({ min: 2, max: 100 }).withMessage("Name must be 2-100 characters"),
  
  body("nameAr")
    .trim()
    .notEmpty().withMessage("Arabic name is required")
    .isLength({ min: 2, max: 100 }).withMessage("Name must be 2-100 characters"),
  
  body("type")
    .isIn(['Incoming', 'Outgoing', 'Domestic', 'Educational', 'Corporate'])
    .withMessage("Invalid category type"),
  
  body("descriptionEn")
    .trim()
    .optional()
    .isLength({ max: 1000 }).withMessage("Description too long"),
  
  body("descriptionAr")
    .trim()
    .optional()
    .isLength({ max: 1000 }).withMessage("Description too long"),
  
  body("country")
    .optional()
     .isIn(['Egypt', 'Albania']).withMessage("Invalid country"),
  
  body("isActive")
    .optional()
    .isBoolean().withMessage("isActive must be boolean")
];

/**
 * Validation Error Handler
 * Centralized error response for validation failures
 * 
 * Usage: app.post('/register', validateRegister, handleValidationErrors, controller)
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    // Format validation errors for client
    const formattedErrors = errors.array().reduce((acc, error) => {
      acc[error.path] = error.msg;
      return acc;
    }, {});
    
    return res.status(400).json({
      // print the resone of failed validation as text and the details in a separate field for easier client handling 

      error: "Validation failed: " + Object.values(formattedErrors).join(', '),
      details: formattedErrors
    });
  }
  
  next();
};

// Visa validation
const validateVisa = [
  body("fullName")
    .trim()
    .notEmpty().withMessage("Full name is required")
    .isLength({ min: 2, max: 100 }).withMessage("Full name must be 2-100 characters"),
  
  body("email")
    .trim()
    .normalizeEmail()
    .isEmail().withMessage("Email must be valid"),
  
  body("phone")
    .trim()
    .notEmpty().withMessage("Phone number is required")
    .matches(/^[0-9+\-\s()]+$/).withMessage("Phone number is invalid")
    .isLength({ min: 10 }).withMessage("Phone must be at least 10 digits"),
  
  body("destinations")
    .isArray({ min: 1 }).withMessage("At least one destination is required"),
  
  body("otherCountries")
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage("Other countries text too long"),
  
  body("hasTraveledAbroad")
    .optional()
    .isBoolean().withMessage("hasTraveledAbroad must be boolean"),
  
  body("visitedCountries")
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage("Visited countries text too long")
];

module.exports = {
  validateRegister,
  validateLogin,
  validateCategory,
  validateVisa,
  handleValidationErrors
};
