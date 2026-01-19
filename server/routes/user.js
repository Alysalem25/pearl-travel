// const express = require('express');
// const router = express.Router();
// const { registerValidation } = require('../middleware/validator');
// const auth = require('../middleware/auth');
// const { register, login } = require('../controllers/authController');


// // Public Register Route with Validation
// router.post('/register', registerValidation, register);
// // router.post('/login',registerValidation, validateLogin, controle.login);


// // Protected Route with JWT
// router.get('/me', auth, (req, res) => {
//   res.json({ msg: "Welcome to your private profile", user: req.user });
// });

// module.exports = router;