const mongoose = require("mongoose");

const BookedCruseiesSchema = new mongoose.Schema({
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
    userNumber: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        default: "",
    },
    cruisies: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Cruisies",
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

module.exports = mongoose.models.BookedCruseies || mongoose.model("BookedCruseies", BookedCruseiesSchema);