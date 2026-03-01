const mongoose = require("mongoose");

const DaySchema = new mongoose.Schema(
  {
    dayNumber: { type: Number, required: true },

    titleEn: { type: String, required: true },
    titleAr: { type: String, required: true },

    descriptionEn: { type: String, required: true },
    descriptionAr: { type: String, required: true },
  },
  { _id: false }
);

const ProgramSchema = new mongoose.Schema(
  {
    titleEn: { type: String, required: true, trim: true },
    titleAr: { type: String, required: true, trim: true },

    descriptionEn: { type: String, required: true },
    descriptionAr: { type: String, required: true },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    country: {
      type: String,
      enum: ["Egypt", "Albania"],
      default: "Egypt",
    },

    durationDays: { type: Number, required: true },
    durationNights: { type: Number, required: true },

    price: { type: Number, required: true },

    images: [{ type: String }], // image URLs or filenames

    days: {
      type: [DaySchema],
      validate: v => v.length > 0,
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Program", ProgramSchema);
