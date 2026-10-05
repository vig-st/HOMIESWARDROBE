const express = require('express');
const router = express.Router();
const { register, login, googleSignIn, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleSignIn);
router.get('/me', protect, getMe);

module.exports = router;
