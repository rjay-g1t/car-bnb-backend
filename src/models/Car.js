const mongoose = require('mongoose');

const carSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'A car must belong to an owner'],
    },
    make: {
      type: String,
      required: [true, 'Please provide car make'],
    },
    model: {
      type: String,
      required: [true, 'Please provide car model'],
    },
    year: {
      type: Number,
      required: [true, 'Please provide car year'],
    },
    color: String,
    transmission: {
      type: String,
      enum: ['automatic', 'manual'],
      default: 'automatic',
    },
    fuelType: {
      type: String,
      enum: ['petrol', 'diesel', 'electric', 'hybrid'],
      default: 'petrol',
    },
    seats: {
      type: Number,
      required: [true, 'Please provide number of seats'],
    },
    location: {
      address: String,
      city: String,
      state: String,
      zipCode: String,
      coordinates: {
        type: [Number],
        index: '2dsphere',
      },
    },
    dailyRate: {
      type: Number,
      required: [true, 'Please provide daily rate'],
    },
    weeklyRate: Number,
    monthlyRate: Number,
    features: [String],
    description: String,
    images: [String],
    availability: {
      type: Boolean,
      default: true,
    },
    availabilityCalendar: [
      {
        startDate: Date,
        endDate: Date,
        isBooked: Boolean,
      },
    ],
    averageRating: {
      type: Number,
      default: 0,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

carSchema.virtual('bookings', {
  ref: 'Booking',
  foreignField: 'car',
  localField: '_id',
});

carSchema.virtual('ratings', {
  ref: 'Rating',
  foreignField: 'car',
  localField: '_id',
});

carSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

carSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'owner',
    select: 'name email phone averageRating',
  });
  next();
});

const Car = mongoose.model('Car', carSchema);

module.exports = Car;
