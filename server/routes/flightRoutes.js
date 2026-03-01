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
router.post("/", async (req, res, next) => {
    try {
        const {
            userEmail,
            userName,
            userNumber,
            tripType,
            from,
            to,
            date,
            returnDate,
            multiCities,
            numOfAdults,
            numOfChildren,
            cabinClass,
        } = req.body;

        // ===============================
        // Basic Validation
        // ===============================
        if (!userEmail) {
            return res.status(400).json({ error: "User email is required" });
        }
        if (!userName) {
            return res.status(400).json({ error: "User name is required" });
        }
        if (!userNumber) {
            return res.status(400).json({ error: "User number is required" });
        }

        if (!tripType) {
            return res.status(400).json({ error: "Trip type is required" });
        }

        // ===============================
        // Trip Type Validation
        // ===============================
        if (tripType === "round") {
            if (!from) {
                return res.status(400).json({ error: "Round from missing" });
            }
            if (!to) {
                return res.status(400).json({ error: "Round to missing" });
            }
            if (!date) {
                return res.status(400).json({ error: "Round date missing" });
            }
            if (!returnDate) {
                return res.status(400).json({ error: "Round return date missing" });
            }
        }

        if (tripType === "oneway") {
            if (!from || !to || !date) {
                return res.status(400).json({ error: "One way data missing" });
            }
        }

        if (tripType === "multi") {
            if (!multiCities || multiCities.length < 2) {
                return res.status(400).json({
                    error: "Multi city must contain at least 2 flights",
                });
            }
        }

        // ===============================
        // Create Flight Object
        // ===============================
        const flightData = {
            userEmail,
            userName,
            userNumber,
            tripType,
            numOfAdults,
            numOfChildren,
            cabinClass,
        };

        if (tripType !== "multi") {
            flightData.from = from;
            flightData.to = to;
            flightData.date = date;
        }

        if (tripType === "round") {
            flightData.returnDate = returnDate;
        }

        if (tripType === "multi") {
            flightData.multiCities = multiCities;
        }

        const flight = await Flights.create(flightData);

        res.status(201).json({
            message: "Flight request submitted successfully",
            data: flight,
        });
    } catch (error) {
        next(error);
    }
});

router.get("/", authMiddleware, authorize("admin"), async (req, res, next) => {
    try {
        // populate country references for admin-friendly output
        const flights = await Flights.find().populate('from', 'nameEn').populate('to', 'nameEn').populate('reviewedBy', 'name');
        res.json(flights.map(f => ({
            _id: f._id,
            userEmail: f.userEmail,
            userName: f.userName,
            userNumber: f.userNumber,
            from: f.from ? (f.from.nameEn || f.from) : null,
            to: f.to ? (f.to.nameEn || f.to) : null,
            status: f.status,
            createdAt: f.createdAt,
            reviewedBy: f.reviewedBy

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
router.put(
  "/:id/status",
  authMiddleware,
  authorize("admin"),
  async (req, res, next) => {
    try {
      let { reviewedBy, status } = req.body;

      // Validate status
      if (!["pending", "reviewed"].includes(status)) {
        return res.status(400).json({ error: "Invalid status value" });
      }

      // Validate ObjectId early
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ error: "Invalid flight id" });
      }

      // If no reviewedBy provided → use logged-in admin
      if (!reviewedBy) {
        reviewedBy = req.user.id; // already authenticated admin
      }

      const flight = await Flights.findByIdAndUpdate(
        req.params.id,
        {
          status,
          reviewedBy: status === "reviewed" ? reviewedBy : null
        },
        {
          new: true,
          runValidators: true
        }
      );

      if (!flight) {
        return res.status(404).json({ error: "Flight not found" });
      }

      res.json(flight);
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;    