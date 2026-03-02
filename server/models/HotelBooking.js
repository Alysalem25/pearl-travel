const mongoose = require("mongoose");

const hotelBookingSchema = new mongoose.Schema({
    country: String,
    city: String,
    hotelName: String,
    fromDate: Date,
    toDate: Date,

    adults: Number,
    children: Number,
    childrenAges: [Number],
    infants: Number,

    userEmail: { type: String, required: true, trim: true },
    userName: { type: String, required: true, trim: true },
    userPhone: { type: String, required: true, trim: true },
    remarks: String,
    status: { type: String, enum: ["pending", "reviewed"], default: "pending" },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

module.exports = mongoose.model("HotelBooking", hotelBookingSchema);