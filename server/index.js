const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // 1. Import cors
require('dotenv').config();
const Admin = require('./models/Admin');
const Program = require('./models/Programs');
const Category = require('./models/Category'); // Capitalized for consistency
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const upload = require("./middlewares/upload");
const uploadCategory = require("./middlewares/uploadCategory");
const path = require("path");

const app = express();
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));



// Serve uploaded images statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Registration Endpoint
app.post('/register', async (req, res) => {
  const { name, email, password, role, number } = req.body;
  try {
    let user = await Admin.findOne({ email });
    if (user) return res.status(400).json({ msg: "User already exists" });

    // Ensure you have hashing logic in your Admin model 'pre-save' hook 
    // or hash it here using bcrypt.hash(password, 10)
    user = new Admin({ name, email, password, role, number });
    await user.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fixed Stats Endpoint
app.get('/stats', async (req, res) => {
  try {
    const [
      userCount,
      activePrograms,
      inactivePrograms,
      categoriesCount,
      egyptPrograms,
      internationalPrograms
    ] = await Promise.all([
      Admin.countDocuments(),
      Program.countDocuments({ status: "active" }),
      Program.countDocuments({ status: "inactive" }),
      Category.countDocuments(),
      // Pearl Travel offers local tours in Cairo, Alexandria, and Siwa [cite: 26, 54, 237]
      Program.countDocuments({ type: "Domestic" }),
      // Outgoing tours include Jordan, Turkey, and Europe [cite: 146, 402, 454]
      Program.countDocuments({ type: "Outgoing" })
    ]);

    // Wrap results in a 'stats' object to match your frontend code
    res.json({
      stats: {
        userCount,
        activePrograms,
        totalPrograms: activePrograms + inactivePrograms,
        categoriesCount,
        egyptPrograms,
        internationalPrograms
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// all categories endpoints
{
  // Get all categories
app.get('/categories', async (req, res) => {
  try {
    const categories = await Category.find();
    const normalizedCategories = categories.map(category => ({
      ...category.toObject(),
      images: category.images ? category.images.map(normalizeImagePath) : []
    }));
    res.json(normalizedCategories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

  // add a new category
  app.post('/categories', uploadCategory.array("images", 1)
    , async (req, res) => {
      if (!req.body) {
        return res.status(400).json({ error: "Request body is missing" });
      }

      const {
        nameEn,
        nameAr,
        type,
        descriptionEn,
        descriptionAr,
        country,
        isActive
      } = req.body;

      try {
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
        res.status(201).json(category);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

  // add image to existing category
  app.post(
    "/categories/:id/images",
    uploadCategory.array("images", 1),
    async (req, res) => {
      try {
        const category = await Category.findById(req.params.id);
        if (!category) {
          return res.status(404).json({ message: "Category not found" });
        }

        const newImages = (req.files || []).map(f => f.filename);

        if (!category.images) category.images = [];
        category.images.push(...newImages);
        await category.save();

        res.json({
          message: "Image added successfully",
          images: category.images
        });

      } catch (err) {
        res.status(500).json({ message: "Failed to add image", error: err.message });
      }
    }
  );

  // edit category 
  app.put('/categories/:id', async (req, res) => {
    const { nameEn, nameAr, type, isActive } = req.body;

    try {
      const updatedCategory = await Category.findByIdAndUpdate(
        req.params.id,
        { nameEn, nameAr, type, isActive },
        { new: true }
      );

      if (!updatedCategory) {
        return res.status(404).json({ error: 'Category not found' });
      }

      res.json(updatedCategory);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // delete category
  app.delete('/categories/:id', async (req, res) => {
    try {
      const deletedCategory = await Category.findByIdAndDelete(req.params.id);
      if (!deletedCategory) {
        return res.status(404).json({ error: "Category not found" });
      }
      res.json({ message: "Category deleted successfully" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // get categories by country
app.get('/country-category/:country', async (req, res) => {
  const { country } = req.params;

  try {
    const categories = await Category.find({
      country,
      isActive: true
    });

    const normalizedCategories = categories.map(category => {
      // Use the first image if present (Category.images is an array)
      const firstImage = Array.isArray(category.images) && category.images.length > 0
        ? normalizeImagePath(category.images[0])
        : null;

      const imageUrl = firstImage
        ? `${req.protocol}://${req.get('host')}/uploads/categories/${firstImage}`
        : null;

      return {
        ...category.toObject(),
        image: imageUrl
      };
    });

    res.json(normalizedCategories);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



}

// programs endpoints

// Helper function to normalize image paths (handle both old full paths and new filenames)
const normalizeImagePath = (img) => {
  if (!img) return img;
  // If it's already just a filename, return it
  if (!img.startsWith('/')) return img;
  // If it's a full path, extract just the filename
  return img.split('/').pop();
};

// Get all programs
{
  app.get('/programs', async (req, res) => {
    try {
      const programs = await Program.find();
      // Normalize image paths for backward compatibility
      const normalizedPrograms = programs.map(program => ({
        ...program.toObject(),
        images: program.images ? program.images.map(normalizeImagePath) : []
      }));
      res.json(normalizedPrograms);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  //  get program by id
  app.get('/programs/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const program = await Program.findById(id);
      if (!program) {
        return res.status(404).json({ error: "Program not found" });
      }
      // Normalize image paths for backward compatibility
      const normalizedProgram = {
        ...program.toObject(),
        images: program.images ? program.images.map(normalizeImagePath) : []
      };
      res.json(normalizedProgram);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });



  // Add a new program
  // app.post('/programs', upload.array("images", 10), async (req, res) => {
  //   try {
  //     const images = (req.files || []).map(f => f.filename);

  //     const newProgram = new Program({
  //       ...req.body,
  //       images
  //     });

  //     await newProgram.save();
  //     res.status(201).json(newProgram);
  //   } catch (err) {
  //     res.status(500).json({ error: err.message });
  //   }
  // });
  app.post(
    '/programs',
    upload.array("images", 10),
    async (req, res) => {
      try {
        const images = (req.files || []).map(f => f.filename);

        // 👇 VERY IMPORTANT
        const days = req.body.days
          ? JSON.parse(req.body.days)
          : [];

        const newProgram = new Program({
          ...req.body,
          days,
          images,
        });

        await newProgram.save();
        res.status(201).json(newProgram);

      } catch (err) {
        console.error("CREATE PROGRAM ERROR:", err);
        res.status(500).json({ error: err.message });
      }
    }
  );


  // add image to existing program
  app.post(
    "/programs/:id/images",
    upload.array("images", 10),
    async (req, res) => {
      try {
        const program = await Program.findById(req.params.id);

        if (!program) {
          return res.status(404).json({ message: "Program not found" });
        }

        const newImages = req.files.map(file => file.filename);

        program.images.push(...newImages);
        await program.save();

        res.json({
          message: "Images added successfully",
          images: program.images
        });

      } catch (error) {
        res.status(500).json({
          message: "Failed to add images",
          error: error.message
        });
      }
    }
  );

  // remove image from existing program
  app.delete("/programs/:id/images", async (req, res) => {
    try {
      const { image } = req.body;

      const program = await Program.findById(req.params.id);
      if (!program) {
        return res.status(404).json({ message: "Program not found" });
      }

      program.images = program.images.filter(img => img !== image);
      await program.save();

      res.json({
        message: "Image removed",
        images: program.images
      });

    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });


  // edit a program
  app.put(
    "/programs/:id",
    upload.array("images", 10),
    async (req, res) => {
      try {
        const program = await Program.findById(req.params.id);
        if (!program) return res.status(404).json({ message: "Not found" });

        const newImages = req.files?.map(f => f.filename) || [];

        if (req.body.days) {
          program.days = JSON.parse(req.body.days);
        }

        Object.assign(program, req.body);

        if (newImages.length > 0) {
          program.images.push(...newImages);
        }

        await program.save();
        res.json(program);

      } catch (err) {
        console.error("UPDATE PROGRAM ERROR:", err);
        res.status(500).json({ error: err.message });
      }
    }
  );


  // delete program
  app.delete("/programs/:id", async (req, res) => {
    try {
      const program = await Program.findByIdAndDelete(req.params.id);
      if (!program) {
        return res.status(404).json({ message: "Program not found" });
      }
      res.json({ message: "Program deleted successfully" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
}
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));