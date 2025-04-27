const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.ObjectId,
      ref: 'Booking',
      required: [true, 'Rating must belong to a booking'],
    },
    rater: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Rating must have an author'],
    },
    ratee: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Rating must have a recipient'],
    },
    car: {
      type: mongoose.Schema.ObjectId,
      ref: 'Car',
    },
    score: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, 'Rating must have a score'],
    },
    comment: {
      type: String,
      maxlength: 500,
    },
    ratingType: {
      type: String,
      enum: ['owner', 'renter', 'car'],
      required: [true, 'Rating must have a type'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

ratingSchema.index({ booking: 1, rater: 1, ratee: 1 }, { unique: true });

ratingSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'rater',
    select: 'name',
  });

  next();
});

ratingSchema.statics.calcAverageRatings = async function (userId) {
  const stats = await this.aggregate([
    {
      $match: { ratee: userId },
    },
    {
      $group: {
        _id: '$ratee',
        avgRating: { $avg: '$score' },
      },
    },
  ]);

  if (stats.length > 0) {
    await mongoose.model('User').findByIdAndUpdate(userId, {
      averageRating: Math.round(stats[0].avgRating * 10) / 10,
    });
  }
};

ratingSchema.statics.calcAverageCarRatings = async function (carId) {
  const stats = await this.aggregate([
    {
      $match: { car: carId, ratingType: 'car' },
    },
    {
      $group: {
        _id: '$car',
        avgRating: { $avg: '$score' },
      },
    },
  ]);

  if (stats.length > 0) {
    await mongoose.model('Car').findByIdAndUpdate(carId, {
      averageRating: Math.round(stats[0].avgRating * 10) / 10,
    });
  }
};

ratingSchema.post('save', function () {
  if (this.ratingType === 'car' && this.car) {
    this.constructor.calcAverageCarRatings(this.car);
  } else {
    this.constructor.calcAverageRatings(this.ratee);
  }
});

const Rating = mongoose.model('Rating', ratingSchema);

module.exports = Rating;
