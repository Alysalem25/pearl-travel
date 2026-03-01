const mongoose = require("mongoose");

const CompanySchema = new mongoose.Schema({
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


    images: [String],

}, {
    timestamps: true,
});

module.exports = mongoose.models.Company || mongoose.model("Company", CompanySchema);