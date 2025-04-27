const express = require('express');
const kycController = require('../controllers/kycController');
const authController = require('../controllers/authController');

const router = express.Router();

router.use(authController.protect);

router.post('/submit', kycController.submitKYC);
router.get('/status', kycController.getKYCStatus);

router.use(authController.restrictTo('admin'));
router.post('/verify', kycController.verifyKYC);

module.exports = router;
