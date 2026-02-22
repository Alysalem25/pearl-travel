const express = require("express");
const path = require("path");
const uploadCountry = require("../middlewares/uploadCountry");
const authMiddleware = require("../middlewares/authMiddleware");
const authorize = require("../middlewares/authorizeMiddleware");
const { validateCountry, handleValidationErrors } = require("../middlewares/validators");
const Country = require("../models/Country");

const router = express.Router();

/**
 * Image path normalization helper
 * ✅ Returns: /uploads/categories/filename.jpg
 * Used by API to return absolute paths that work in browser
 */
function normalizeImagePath(imagePath) {
  return `/uploads/countries/${imagePath}`;
}

/**
 * GET /countries
 * Get all countries - PUBLIC ROUTE 
 */
router.get("/", async (req, res, next) => {
  try {
    const countries = await Country.find();
    const normalizedCountries = countries.map(country => ({
      ...country.toObject(),
      images: country.images ? country.images.map(normalizeImagePath) : []
    }));
    res.json(normalizedCountries);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /countries/by-name/:nameEn
 * Get country by English name - PUBLIC ROUTE
 */
router.get("/by-name/:nameEn", async (req, res, next) => {
  try {
    const country = await Country.findOne({ nameEn: req.params.nameEn });

    if (!country) {
      return res.status(404).json({ error: "country not found" });
    }

    const normalizedCountry = {
      ...country.toObject(),
      images: country.images ? country.images.map(normalizeImagePath) : []
    };

    res.json(normalizedCountry);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /countries/:id
 * Get single country by ID - PUBLIC ROUTE
 */
// router.get("/:id", async (req, res, next) => {
//   try {
//     const country = await Country.findById(req.params.id);

//     if (!country) {
//       return res.status(404).json({ error: "country not found" });
//     }

//     const normalizedCountry = {
//       ...country.toObject(),
//       images: country.images ? country.images.map(normalizeImagePath) : []
//     };

//     res.json(normalizedCountry);
//   } catch (err) {
//     next(err);
//   }
// });

/**
 * POST /countries
 * Create new country - ADMIN ONLY
 * 
 * Security:
 * - Requires authentication (authMiddleware)
 * - Requires admin role (authorize)
 * - Validates input (validateCountries)
 * - File uploads restricted to 1 image
 */
router.post(
  "/",
  authMiddleware,
  authorize("admin"),
  uploadCountry.array("images", 1),
  //   validateCategory,
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const {
        nameEn,
        nameAr,
        inhomepage,
        inVisa,
        inFromCountry,
        inToCountry
      } = req.body;

      const images = (req.files || []).map(f => f.filename);

      const country = new Country({
        nameEn,
        nameAr,
        inhomepage,
        inVisa,
        inFromCountry,
        inToCountry,
        images
      });
      await country.save();

      const response = {
        ...country.toObject(),
        images: country.images.map(normalizeImagePath)
      };

      res.status(201).json(response);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * PUT /counties/:id
 * Update country - ADMIN ONLY
 */
router.put(
  "/:id",
  authMiddleware,
  authorize("admin"),
  //   validateCategory,
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const { nameEn, nameAr, inhomepage } = req.body;

      const country = await Country.findByIdAndUpdate(
        req.params.id,
        { nameEn, nameAr, inhomepage },
        { new: true, runValidators: true }
      );

      if (!country) {
        return res.status(404).json({ error: "country not found" });
      }

      const response = {
        ...country.toObject(),
        images: country.images ? country.images.map(normalizeImagePath) : []
      };

      res.json(response);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * DELETE /countries/:id
 * Delete country - ADMIN ONLY
 */
router.delete("/:id", authMiddleware, authorize("admin"), async (req, res, next) => {
  try {
    const country = await Country.findByIdAndDelete(req.params.id);

    if (!country) {
      return res.status(404).json({ error: "country not found" });
    }

    res.json({ message: "country deleted successfully" });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /countries/:id/images
 * Add image to existing country - ADMIN ONLY
 */
router.post(
  "/:id/images",
  authMiddleware,
  authorize("admin"),
  uploadCountry.array("images", 1),
  async (req, res, next) => {
    try {
      const country = await Country.findById(req.params.id);

      if (!country) {
        return res.status(404).json({ error: "country not found" });
      }

      const images = (req.files || []).map(f => f.filename);
      country.images.push(...images);

      await country.save();

      const response = {
        ...country.toObject(),
        images: country.images ? country.images.map(normalizeImagePath) : []
      };

      res.json(response);
    } catch (err) {
      next(err);
    }
  }
);


//  inhomepage countries
router.get("/inhomepage", async (req, res, next) => {
  try {
    const countries = await Country.find({ inhomepage: true });
    const normalizedCountries = countries.map(country => ({
      ...country.toObject(),
      images: country.images ? country.images.map(normalizeImagePath) : []
    }));
    res.json(normalizedCountries);
  } catch (err) {
    next(err);
  }
});


// inVisa countries
router.get("/inVisa", async (req, res, next) => {
    try {
    const countries = await Country.find({ inVisa: true });
    const normalizedCountries = countries.map(country => ({
      ...country.toObject(),
      images: country.images ? country.images.map(normalizeImagePath) : []
    }));
    res.json(normalizedCountries);
  } catch (err) {
    next(err);
  }
});

// inFromCountry countries
router.get("/inFromCountry", async (req, res, next) => {
  try {
    const countries = await Country.find({ inFromCountry: true });

    res.json(countries);
  } catch (err) {
    next(err);
  }
});

// inToCountry countries
router.get("/inToCountry", async (req, res, next) => {
  try {
    const countries = await Country.find({ inToCountry: true });
    const normalizedCountries = countries.map(country => ({
      ...country.toObject(),
      images: country.images ? country.images.map(normalizeImagePath) : []
    }));
    res.json(normalizedCountries);
  } catch (err) {
    next(err);
  }
});
module.exports = router;    