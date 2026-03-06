const express = require('express');
const User = require('../models/Users');
const Flights = require('../models/Flights');
const HotelBooking = require('../models/HotelBooking');
const CarTrip = require('../models/CarsTrips');
const Visa = require('../models/Visa');
const authMiddleware = require('../middlewares/authMiddleware');
const authorize = require('../middlewares/authorizeMiddleware');

const router = express.Router();

/**
 * GET /users/:id/summary
 * Returns counts of reviewed resources for a given user (admin only).
 */
// get basic user info (admin only)
router.get('/:id', authMiddleware, authorize('admin'), async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) {
    next(err);
  }
});

// summary with optional time range
router.get('/:id/summary', authMiddleware, authorize('admin'), async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const email = user.email;
    // parse optional query params
    const { start, end } = req.query;

    // Default range: from start of current month until now
    const now = new Date();
    const defaultStartOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const startDate = start ? new Date(String(start)) : defaultStartOfMonth;
    const endDate = end ? new Date(String(end)) : now;

    const filter = {
      userEmail: email,
      status: 'reviewed',
      updatedAt: {
        $gte: startDate,
        $lte: endDate
      }
    };

    const [
      reviewedFlightsCount,
      reviewedHotelsCount,
      reviewedCarsCount,
      reviewedVisasCount
    ] = await Promise.all([
      Flights.countDocuments(filter),
      HotelBooking.countDocuments(filter),
      CarTrip.countDocuments(filter),
      Visa.countDocuments({
        email: email,
        status: 'reviewed',
        updatedAt: filter.updatedAt
      })
    ]);

    res.json({
      reviewedFlightsCount,
      reviewedHotelsCount,
      reviewedCarsCount,
      reviewedVisasCount
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
