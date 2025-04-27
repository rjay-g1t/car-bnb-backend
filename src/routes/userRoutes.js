const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();

router.use(authController.protect);

router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);
router.get('/bookings', userController.getUserBookings);
router.get('/owner-bookings', userController.getOwnerBookings);
router.delete('/delete-account', userController.deleteAccount);

module.exports = router;
