// const User = require('../models/Admin');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');

// exports.login = async (req, res) => {
//     const { email, password } = req.body;

//     try {
//         // 1. Check if user exists
//         let user = await User.findOne({ email });
//         if (!user) return res.status(400).json({ msg: "Invalid Credentials" });

//         // 2. Compare password
//         const isMatch = await bcrypt.compare(password, user.password);
//         if (!isMatch) return res.status(400).json({ msg: "Invalid Credentials" });

//         // 3. Create JWT Payload
//         const payload = { user: { id: user.id } };

//         // 4. Sign Token
//         jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
//             if (err) throw err;
//             res.json({ token }); // Send token to frontend
//         });

//     } catch (err) {
//         res.status(500).send('Server Error');
//     }
// };

// exports.register = async (req, res) => {
//     const { name, email, password, number } = req.body;
//     try {
//         // Check if user already exists
//         let user = await User.findOne({ email });
//         if (user) return res.status(400).json({ msg: "User already exists" });  
//         // Create new user
//         user = new User({ name, email, password, number });
//         await user.save();
//         // Create JWT Payload
//         const payload = { user: { id: user.id } };
//         // Sign Token
//         jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
//             if (err) throw err;
//             res.json({ token }); // Send token to frontend
//         });
//     } catch (err) {
//         res.status(500).send('Server Error');
//     }
// };

// exports.refreshToken = (req, res) => {
//     const refreshToken = req.body.refreshToken;
//     if (!refreshToken) return res.sendStatus(401);
//     // Verify the refresh token and generate a new access token
//     // Logic to handle token verification and generation
//     res.json({ accessToken: 'newAccessToken' });
// };