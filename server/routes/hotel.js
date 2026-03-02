const express = require("express");
const router = express.Router();
const HotelBooking = require("../models/HotelBooking");
const authMiddleware = require("../middlewares/authMiddleware");
const authorize = require("../middlewares/authorizeMiddleware");

router.post("/", async (req, res, next) => {
    try {
        // Ensure isReturn is a boolean if it comes as a string or undefined
        const tripData = {
            ...req.body,
            isReturn: req.body.isReturn === true || req.body.isReturn === 'true'
        };

        const booking = new HotelBooking(tripData);
        await booking.save();

        res.status(201).json({
            message: "Trip created successfully",
            data: booking
        });
    } catch (err) {
        // Catch Mongoose validation errors
        if (err.name === 'ValidationError') {
            return res.status(400).json({ error: err.message });
        }
        next(err);
    }
});


// admin get all car trips
router.get("/", async (req, res, next) => {
    try {
        const hotelBookings = await HotelBooking.find().populate("reviewedBy", "name");
        res.json(hotelBookings);
    } catch (err) {
        next(err);
    }
});

// delete car trip
router.delete("/:id", authMiddleware, authorize("admin"), async (req, res, next) => {
    try {
        const booking = await HotelBooking.findByIdAndDelete(req.params.id);
        if (!booking) return res.status(404).json({ error: "Hotel booking not found" });
        res.json({ message: "Hotel booking deleted" });
    } catch (err) {
        next(err);
    }
});

// update car trip status
router.put("/:id/status", authMiddleware, authorize("admin"), async (req, res, next) => {
    try {
        const { status } = req.body;
        if (!["pending", "reviewed"].includes(status)) {
            return res.status(400).json({ error: "Invalid status value" });
        }
        const booking = await HotelBooking.findByIdAndUpdate(
            req.params.id,
            { status: status === "pending" ? "pending" : "reviewed", reviewedBy: req.user.id },
            { new: true, runValidators: true }
        );
        if (!booking) return res.status(404).json({ error: "Hotel booking not found" });
        res.json(booking);
    } catch (err) {
        next(err);
    }
});
module.exports = router;