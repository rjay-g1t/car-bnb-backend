const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    car: {
      type: mongoose.Schema.ObjectId,
      ref: 'Car',
      required: [true, 'Booking must belong to a Car'],
    },
    renter: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Booking must belong to a User'],
    },
    owner: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Booking must have an owner'],
    },
    startDate: {
      type: Date,
      required: [true, 'Please provide start date'],
    },
    endDate: {
      type: Date,
      required: [true, 'Please provide end date'],
    },
    totalPrice: {
      type: Number,
      required: [true, 'Booking must have a price'],
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'partially_paid', 'paid', 'refunded'],
      default: 'unpaid',
    },
    paymentId: String,
    cancellationReason: String,
    pickupAddress: String,
    dropoffAddress: String,
    additionalRequests: String,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

bookingSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'car',
    select: 'make model year color images dailyRate',
  })
    .populate({
      path: 'renter',
      select: 'name email phone',
    })
    .populate({
      path: 'owner',
      select: 'name email phone',
    });

  next();
});

bookingSchema.statics.calculateTotalPrice = function (
  dailyRate,
  startDate,
  endDate
) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const durationInMs = end - start;
  const durationInDays = Math.ceil(durationInMs / (1000 * 60 * 60 * 24));

  return dailyRate * durationInDays;
};

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
