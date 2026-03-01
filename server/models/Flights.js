const mongoose = require("mongoose");

const FlightSchema = new mongoose.Schema(
  {
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

  tripType: {
  type: String,
  enum: ["round", "oneway", "multi"],
  default: "round",
  required: true,
},

    // ====== ROUND & ONE WAY ======
    from: {
      type: String,
      required: function () {
        return this.tripType !== "multi";
      },
    },

    to: {
      type: String,
      required: function () {
        return this.tripType !== "multi";
      },
    },

    date: {
      type: String,
      required: function () {
        return this.tripType !== "multi";
      },
    },

    returnDate: {
      type: String,
      required: function () {
        return this.tripType === "round";
      },
    },

    // ====== MULTI CITY ======
    multiCities: [
      {
        from: { type: String, required: true },
        to: { type: String, required: true },
        date: { type: String, required: true },
      },
    ],

    // ====== PASSENGERS ======
    numOfAdults: {
      type: Number,
      required: true,
      min: 1,
    },

    numOfChildren: {
      type: Number,
      default: 0,
      min: 0,
    },

    cabinClass: {
      type: String,
      enum: ["economy", "business", "first"],
      default: "economy",
    },

    status: {
      type: String,
      enum: ["pending", "reviewed"],
      default: "pending",
    },

    reviewedBy:{
         type: mongoose.Schema.Types.ObjectId,
         ref: "User",
    }
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.Flight || mongoose.model("Flight", FlightSchema);