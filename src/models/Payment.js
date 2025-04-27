const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.ObjectId,
      ref: 'Booking',
      required: [true, 'Payment must belong to a Booking'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Payment must belong to a User'],
    },
    amount: {
      type: Number,
      required: [true, 'Payment must have an amount'],
    },
    currency: {
      type: String,
      default: 'USD',
    },
    paymentMethod: {
      type: String,
      required: [true, 'Payment must have a payment method'],
    },
    status: {
      type: String,
      enum: ['pending', 'succeeded', 'failed', 'refunded'],
      default: 'pending',
    },
    stripePaymentIntentId: String,
    stripeCustomerId: String,
    refundId: String,
    refundReason: String,
  },
  {
    timestamps: true,
  }
);

paymentSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'booking',
    select: 'startDate endDate totalPrice status',
  }).populate({
    path: 'user',
    select: 'name email',
  });

  next();
});

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;
