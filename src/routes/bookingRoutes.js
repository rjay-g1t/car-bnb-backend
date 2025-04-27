const express = require('express');
const bookingController = require('../controllers/bookingController');
const authController = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

router.use(authController.protect);

router.route('/').post(bookingController.createBooking);

router
  .route('/:id')
  .get(bookingController.getBooking)
  .put(bookingController.updateBooking)
  .delete(bookingController.cancelBooking);

module.exports = router;
