const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false
    },
    number: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user"
    },
    inTeam:{
      type: Boolean,
      default:false,
    },
    images: [String], // array of image filenames

  },
  { timestamps: true }
);

/**
 * 🔐 Hash password before save
 * IMPORTANT:
 * - Uses async/await (Mongoose auto-handles promise)
 * - Do NOT use next() callback with async pre-hooks
 * - Simply return early or throw on error
 */
UserSchema.pre("save", async function () {
  // Only hash if password is new or modified
  if (!this.isModified("password")) {
    return;
  }

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (err) {
    // Mongoose will reject the save promise
    throw err;
  }
});

/**
 * 🔑 Compare password
 */
UserSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", UserSchema);
