const express = require('express');
const router = express.Router();
// const { register, login, getMe } = require('../controllers/authController');
// const { protect } = require('../middleware/auth');

// Placeholder for auth routes until controller is fully implemented
// This prevents server crash while maintaining route structure
router.post('/register', (req, res) => res.json({ message: 'Register endpoint' }));
router.post('/login', (req, res) => res.json({ message: 'Login endpoint' }));
router.get('/me', (req, res) => res.json({ message: 'User info endpoint' }));

module.exports = router;
