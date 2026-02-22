const express = require("express");
const mongoose = require("mongoose");
const Flights = require("../models/Flights");
const authMiddleware = require("../middlewares/authMiddleware");
const authorize = require("../middlewares/authorizeMiddleware");
const { handleValidationErrors } = require("../middlewares/validators");

const router = express.Router();

/********************
 * POST /flights
 * Submit flight information - PUBLIC ROUTE
 * Expected body: { userEmail, from, to }
 ********************/
router.post("/", handleValidationErrors, async (req, res, next) => {
    try {
        const { userEmail, userName, userNumber, from, to } = req.body;
        const flight = new Flights({ userEmail, userName, userNumber, from, to });
        await flight.save();
        res.status(201).json(flight);
    } catch (err) {
        next(err);
    }
});


router.get("/", authMiddleware, authorize("admin"), async (req, res, next) => {
    try {
        // populate country references for admin-friendly output
        const flights = await Flights.find().populate('from', 'nameEn').populate('to', 'nameEn');
        res.json(flights.map(f => ({
            _id: f._id,
            userEmail: f.userEmail,
            userName: f.userName,
            userNumber: f.userNumber,
            from: f.from ? (f.from.nameEn || f.from) : null,
            to: f.to ? (f.to.nameEn || f.to) : null,
            status: f.status,
            createdAt: f.createdAt
        })));
    } catch (err) {
        next(err);
    }
});

// Delete a flight (admin only)
router.delete("/:id", authMiddleware, authorize("admin"), async (req, res, next) => {
    try {
        const flight = await Flights.findByIdAndDelete(req.params.id);
        if (!flight) return res.status(404).json({ error: "Flight not found" });
        res.json({ message: "Flight deleted" });
    } catch (err) {
        next(err);
    }
});

// update flight status (admin only)
router.put("/:id/status", authMiddleware, authorize("admin"), async (req, res, next) => {
    try {
        const { status } = req.body;
        if (!["pending", "reviewed"].includes(status)) {
            return res.status(400).json({ error: "Invalid status value" });
        }

        // validate id early to avoid CastError -> 500
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: "Invalid flight id" });
        }

        // set the requested status (use runValidators to enforce schema enums)
        const flight = await Flights.findByIdAndUpdate(
            req.params.id,
            { status : status === "pending" ? "pending" : "reviewed" },
            { new: true, runValidators: true }
        );
        if (!flight) return res.status(404).json({ error: "Flight not found" });
        res.json(flight);
    } catch (err) {
        next(err);
    }
});

module.exports = router;    