const mongoose = require("mongoose");

const CountrySchema = new mongoose.Schema({
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

    inhomepage: {
        type: Boolean,
        default: false,
    },

    inVisa: {
        type: Boolean,
        default: false,
    },

    inFromCountry: {
        type: Boolean,
        default: false,
    },

    inToCountry: {
        type: Boolean,
        default: false,
    },

    images: [String],

}, {
    timestamps: true,
});

module.exports = mongoose.models.Country || mongoose.model("Country", CountrySchema);