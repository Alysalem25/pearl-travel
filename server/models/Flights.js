const mongoose = require("mongoose");

const FlightSchema = new mongoose.Schema(
    {
        userEmail: {
            type: String,
            required: true,
            trim: true
        },

        userName: {
            type: String,
            required: true,
            trim: true
        },

        userNumber: {
            type: String,
            required: true
        },

        from: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Country",
            required: true,
        },
        to: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Country",
            required: true,
        },

        status: {
            type: String,
            enum: ["pending", "reviewed"],
            default: "pending"
        },
    },
    { timestamps: true }
);

module.exports = mongoose.models.Flight || mongoose.model("Flight", FlightSchema);
