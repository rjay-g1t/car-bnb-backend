const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.processPayment = catchAsync(async (req, res, next) => {
  const booking = await Booking.findById(req.params.bookingId);

  if (!booking) {
    return next(new AppError('No booking found with that ID', 404));
  }

  if (booking.renter.id !== req.user.id) {
    return next(
      new AppError('You can only make payments for your own bookings', 403)
    );
  }

  if (booking.status === 'cancelled') {
    return next(new AppError('Cannot pay for a cancelled booking', 400));
  }

  if (booking.paymentStatus === 'paid') {
    return next(new AppError('Booking is already paid', 400));
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: booking.totalPrice * 100,
    currency: 'usd',
    metadata: {
      bookingId: booking.id,
      carId: booking.car.id,
      userId: req.user.id,
    },
  });

  const payment = await Payment.create({
    booking: booking.id,
    user: req.user.id,
    amount: booking.totalPrice,
    paymentMethod: 'card',
    status: 'pending',
    stripePaymentIntentId: paymentIntent.id,
  });

  res.status(200).json({
    status: 'success',
    clientSecret: paymentIntent.client_secret,
    data: {
      payment,
    },
  });
});

exports.confirmPayment = catchAsync(async (req, res, next) => {
  const { paymentIntentId } = req.body;

  if (!paymentIntentId) {
    return next(new AppError('Please provide payment intent ID', 400));
  }

  const payment = await Payment.findOne({
    stripePaymentIntentId: paymentIntentId,
  });

  if (!payment) {
    return next(new AppError('No payment found with that ID', 404));
  }

  payment.status = 'succeeded';
  await payment.save();

  const booking = await Booking.findById(payment.booking);
  booking.paymentStatus = 'paid';
  booking.status = 'confirmed';
  booking.paymentId = payment.id;
  await booking.save();

  res.status(200).json({
    status: 'success',
    data: {
      payment,
      booking,
    },
  });
});

exports.getPaymentHistory = catchAsync(async (req, res, next) => {
  const payments = await Payment.find({ user: req.user.id });

  res.status(200).json({
    status: 'success',
    results: payments.length,
    data: {
      payments,
    },
  });
});

exports.webhookHandler = async (req, res) => {
  let event;

  try {
    const signature = req.headers['stripe-signature'];

    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;

    await Payment.findOneAndUpdate(
      { stripePaymentIntentId: paymentIntent.id },
      { status: 'succeeded' }
    );

    const payment = await Payment.findOne({
      stripePaymentIntentId: paymentIntent.id,
    });

    if (payment) {
      const booking = await Booking.findById(payment.booking);
      booking.paymentStatus = 'paid';
      booking.status = 'confirmed';
      booking.paymentId = payment.id;
      await booking.save();
    }
  }

  res.status(200).json({ received: true });
};
