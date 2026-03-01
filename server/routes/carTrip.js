const express = require("express");
const router = express.Router();
const CarTrip = require("../models/CarsTrips");
const authMiddleware = require("../middlewares/authMiddleware");
const authorize = require("../middlewares/authorizeMiddleware");

router.post("/", async (req, res, next) => {
  try {
    // Ensure isReturn is a boolean if it comes as a string or undefined
    const tripData = {
      ...req.body,
      isReturn: req.body.isReturn === true || req.body.isReturn === 'true'
    };

    const carTrip = new CarTrip(tripData);
    await carTrip.save();

    res.status(201).json({ 
        message: "Trip created successfully", 
        data: carTrip 
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
    const carTrips = await CarTrip.find().populate("reviewedBy", "name");
    res.json(carTrips);
  } catch (err) {
    next(err);
  }
});

// delete car trip
router.delete("/:id", authMiddleware, authorize("admin"), async (req, res, next) => {
  try {
    const carTrip = await CarTrip.findByIdAndDelete(req.params.id);
    if (!carTrip) return res.status(404).json({ error: "Car trip not found" });
    res.json({ message: "Car trip deleted" });
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
    const carTrip = await CarTrip.findByIdAndUpdate(
      req.params.id,
      { status: status === "pending" ? "pending" : "reviewed" , reviewedBy: req.user.id },
      { new: true, runValidators: true }
    );
    if (!carTrip) return res.status(404).json({ error: "Car trip not found" });
    res.json(carTrip);
  } catch (err) {
    next(err);
  }
});
module.exports = router;