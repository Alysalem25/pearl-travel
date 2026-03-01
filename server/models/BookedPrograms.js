const mongoose = require("mongoose");

const BookedProgramsSchema = new mongoose.Schema({
    userEmail: {
        type: String,
        required: true,
        trim: true,
    },
    userName: {
        type: String,
        required: true,
        trim: true,
    },
    // Useful for categorizing 'Domestic' vs 'International' vs 'Conference'
    userNumber: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        default: "Egypt",
    },
    program: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Program",
        required: true,
    },
    status: {
        type: String,
        enum: ["pending", "reviewed"],
        default: "pending",
    },

}, {
    timestamps: true,
});

module.exports = mongoose.models.BookedPrograms || mongoose.model("BookedPrograms", BookedProgramsSchema);