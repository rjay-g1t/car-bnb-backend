const Rating = require('../models/Rating');
const Booking = require('../models/Booking');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.createOwnerRating = catchAsync(async (req, res, next) => {
  const booking = await Booking.findById(req.body.booking);

  if (!booking) {
    return next(new AppError('No booking found with that ID', 404));
  }

  if (booking.renter.id !== req.user.id) {
    return next(
      new AppError('You can only rate owners for your own bookings', 403)
    );
  }

  if (booking.status !== 'completed') {
    return next(
      new AppError('You can only rate owners after booking is completed', 400)
    );
  }

  const existingRating = await Rating.findOne({
    booking: booking.id,
    rater: req.user.id,
    ratee: booking.owner.id,
    ratingType: 'owner',
  });

  if (existingRating) {
    return next(new AppError('You have already rated this owner', 400));
  }

  const newRating = await Rating.create({
    booking: booking.id,
    rater: req.user.id,
    ratee: booking.owner.id,
    car: booking.car,
    score: req.body.score,
    comment: req.body.comment,
    ratingType: 'owner',
  });

  res.status(201).json({
    status: 'success',
    data: {
      rating: newRating,
    },
  });
});

exports.createRenterRating = catchAsync(async (req, res, next) => {
  const booking = await Booking.findById(req.body.booking);

  if (!booking) {
    return next(new AppError('No booking found with that ID', 404));
  }

  if (booking.owner.id !== req.user.id) {
    return next(
      new AppError('You can only rate renters for your own cars', 403)
    );
  }

  if (booking.status !== 'completed') {
    return next(
      new AppError('You can only rate renters after booking is completed', 400)
    );
  }

  const existingRating = await Rating.findOne({
    booking: booking.id,
    rater: req.user.id,
    ratee: booking.renter.id,
    ratingType: 'renter',
  });

  if (existingRating) {
    return next(new AppError('You have already rated this renter', 400));
  }

  const newRating = await Rating.create({
    booking: booking.id,
    rater: req.user.id,
    ratee: booking.renter.id,
    score: req.body.score,
    comment: req.body.comment,
    ratingType: 'renter',
  });

  res.status(201).json({
    status: 'success',
    data: {
      rating: newRating,
    },
  });
});

exports.createCarRating = catchAsync(async (req, res, next) => {
  const booking = await Booking.findById(req.body.booking);

  if (!booking) {
    return next(new AppError('No booking found with that ID', 404));
  }

  if (booking.renter.id !== req.user.id) {
    return next(
      new AppError('You can only rate cars from your own bookings', 403)
    );
  }

  if (booking.status !== 'completed') {
    return next(
      new AppError('You can only rate cars after booking is completed', 400)
    );
  }

  const existingRating = await Rating.findOne({
    booking: booking.id,
    rater: req.user.id,
    car: booking.car,
    ratingType: 'car',
  });

  if (existingRating) {
    return next(new AppError('You have already rated this car', 400));
  }

  const newRating = await Rating.create({
    booking: booking.id,
    rater: req.user.id,
    ratee: booking.owner.id,
    car: booking.car,
    score: req.body.score,
    comment: req.body.comment,
    ratingType: 'car',
  });

  res.status(201).json({
    status: 'success',
    data: {
      rating: newRating,
    },
  });
});

exports.getOwnerRatings = catchAsync(async (req, res, next) => {
  const ratings = await Rating.find({
    ratee: req.params.id,
    ratingType: 'owner',
  });

  res.status(200).json({
    status: 'success',
    results: ratings.length,
    data: {
      ratings,
    },
  });
});

exports.getRenterRatings = catchAsync(async (req, res, next) => {
  const ratings = await Rating.find({
    ratee: req.params.id,
    ratingType: 'renter',
  });

  res.status(200).json({
    status: 'success',
    results: ratings.length,
    data: {
      ratings,
    },
  });
});
