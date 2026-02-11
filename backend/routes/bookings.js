const express = require('express');
const router = express.Router();
const {
    createBooking,
    getBookings,
    updateBookingStatus,
    createPackageRequest,
    notifyBooking
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');

router.post('/notify', notifyBooking);
router.post('/package-request', createPackageRequest);

router.route('/')
    .post(createBooking)
    .get(protect, authorize('admin', 'staff'), getBookings);

router.route('/:id')
    .put(protect, authorize('admin', 'staff'), updateBookingStatus);

module.exports = router;
