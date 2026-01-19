// const { body, validationResult } = require("express-validator");

// const handleValidationErrors = (req, res, next) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     return res.status(400).json({
//       success: false,
//       message: "Validation failed",
//       errors: errors.array().map((err) => ({
//         field: err.path,
//         message: err.msg,
//       })),
//     });
//   }
//   next();
// };

// // Login validation
// const validateLogin = [
//   body("email")
//     .trim()
//     .notEmpty()
//     .withMessage("Email is required")
//     .isEmail()
//     .withMessage("Please provide a valid email address")
//     .normalizeEmail(),
//   body("password")
//     .notEmpty()
//     .withMessage("Password is required")
//     .isLength({ min: 6 })
//     .withMessage("Password must be at least 6 characters long"),
//   handleValidationErrors,
// ];

// // Admin validation
// const validateAdmin = [
//   body("name")
//     .trim()
//     .notEmpty()
//     .withMessage("Name is required")
//     .isLength({ min: 2, max: 50 })
//     .withMessage("Name must be between 2 and 50 characters"),
//   body("email")
//     .trim()
//     .notEmpty()
//     .withMessage("Email is required")
//     .isEmail()
//     .withMessage("Please provide a valid email address")
//     .normalizeEmail(),
//   body("password")
//     .notEmpty()
//     .withMessage("Password is required")
//     .isLength({ min: 6 })
//     .withMessage("Password must be at least 6 characters long")
//     .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
//     .withMessage("Password must contain at least one uppercase letter, one lowercase letter, and one number"),
//   body("number")
//     .trim()
//     .notEmpty()
//     .withMessage("Phone number is required")
//     .isMobilePhone()
//     .withMessage("Please provide a valid phone number"),
//   handleValidationErrors,
// ];


// module.exports = {
//   validateLogin,
//   validateAdmin,
//   handleValidationErrors,
// };









