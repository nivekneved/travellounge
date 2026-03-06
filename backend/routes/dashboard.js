const express = require('express');
const router = express.Router();
const path = require('path');
const dashboardController = require('../controllers/dashboardController');

const { protect } = require('../middleware/auth');

// API Endpoint for stats
router.get('/api/stats', protect, dashboardController.getTableStats);

// Serve the dashboard UI
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/dashboard.html'));
});

module.exports = router;
