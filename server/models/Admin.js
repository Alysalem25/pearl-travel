const mongoose = require("mongoose");

const AdminSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },
  role: { type: String, required: true, default: 'admin' },
  number: { type: String, required: true, unique: true, trim: true },
}, {
  timestamps: true,
});

module.exports = mongoose.models.Admin || mongoose.model("Admin", AdminSchema);
