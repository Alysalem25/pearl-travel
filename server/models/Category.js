const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema({
    nameEn: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    nameAr: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    // Useful for categorizing 'Domestic' vs 'International' vs 'Conference'
    type: {
        type: String,
        enum: ['Incoming', 'Outgoing', 'Domestic', 'Educational', 'Corporate'],
        required: true
    },
    country: {
        type: String,
        enum: ["Egypt", "Albania"],
        default: "Egypt",
    },
    
    
    images: [String], // array of image filenames

    descriptionEn: { type: String, trim: true },
    descriptionAr: { type: String, trim: true },
    isActive: { type: Boolean, default: true }
}, {
    timestamps: true,
});

module.exports = mongoose.models.Category || mongoose.model("Category", CategorySchema);