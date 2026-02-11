const express = require('express');
const router = express.Router();
const {
    getServiceReviews,
    createReview,
    moderateReview,
    getAllReviews
} = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/services/:serviceId', getServiceReviews);
router.post('/', createReview);

// Admin routes
router.get('/', protect, authorize('admin', 'staff'), getAllReviews);
router.put('/:id', protect, authorize('admin'), moderateReview);

module.exports = router;
