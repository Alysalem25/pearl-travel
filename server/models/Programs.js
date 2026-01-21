const mongoose = require("mongoose");

const ProgramsSchema = new mongoose.Schema({
    titleEn: { type: String, required: true, trim: true },
    titleAr: { type: String, required: true, trim: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    images: [{ type: String, trim: true }],
    country: { type: String, required: true, trim: true, enum: ['Egypt','Albania'] },
    durationDays: { type: Number, required: true },
    durationNights: { type: Number, required: true },   
    price: { type: Number, required: true },
    descriptionEn: { type: String, trim: true },
    descriptionAr: { type: String, trim: true },
    itineraryEn: { type: String, trim: true },
    itineraryAr: { type: String, trim: true },
    // isActive: { type: Boolean, default: true }
    status: { type: String, required: true, enum: ['active', 'inactive'], default: 'active' },
}, {
    timestamps: true,
});

module.exports = mongoose.models.Programs || mongoose.model("Programs", ProgramsSchema);