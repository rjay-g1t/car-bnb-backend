const express = require('express');
const ratingController = require('../controllers/ratingController');
const authController = require('../controllers/authController');

const router = express.Router();

router.get('/owner/:id', ratingController.getOwnerRatings);
router.get('/renter/:id', ratingController.getRenterRatings);

router.use(authController.protect);

router.post('/owner', ratingController.createOwnerRating);
router.post('/renter', ratingController.createRenterRating);
router.post('/car', ratingController.createCarRating);

module.exports = router;
