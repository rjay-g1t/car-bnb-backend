const express = require('express');
const paymentController = require('../controllers/paymentController');
const authController = require('../controllers/authController');

const router = express.Router();

router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  paymentController.webhookHandler
);

router.use(authController.protect);

router.get('/history', paymentController.getPaymentHistory);
router.post('/process/:bookingId', paymentController.processPayment);
router.post('/confirm', paymentController.confirmPayment);

module.exports = router;
