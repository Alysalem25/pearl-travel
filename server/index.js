const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const Admin = require('./models/Admin');
const bcrypt = require('bcryptjs');

const app = express();
app.use(express.json()); // Body parser for JSON

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

app.post('/register', async (req, res) => {
    const { name, email, password, role, number } = req.body;
    try {
        // Check if user already exists
        let user = await Admin.findOne({ email });
        if (user) return res.status(400).json({ msg: "User already exists" });  
        // Create new user
        user = new Admin({ name, email, password, role, number });
        await user.save();
        // Create JWT Payload

        res.status(200).send("User registered successfully");
    } catch (err) {
        res.status(500).send(err.message);
    }
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); 