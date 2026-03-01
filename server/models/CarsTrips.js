const mongoose = require("mongoose");

const CarsTripsSchema = new mongoose.Schema(
  {
    userEmail: { type: String, required: true, trim: true },
    userName: { type: String, required: true, trim: true },
    userNumber: { type: String, required: true },
    from: { type: String, required: true },
    to: { type: String, required: true },
    date: { type: String, required: true },
    isReturn: { type: Boolean, default: false },
    returnDate: {
      type: String,
      required: function () { return this.isReturn; }
    },
    numOfAdults: { type: Number, required: true, min: 1 },
    numOfLuggage: { type: Number, required: true, min: 0 },
    carType: {
      type: String,
      enum: ["Normal", "Premium"],
      required: true
    },
    status: { type: String, enum: ["pending", "reviewed"], default: "pending" },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

module.exports = mongoose.models.CarTrips || mongoose.model("CarTrips", CarsTripsSchema);