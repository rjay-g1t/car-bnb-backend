const Car = require('../models/Car');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.createCar = catchAsync(async (req, res, next) => {
  if (!req.user.kycStatus === 'verified') {
    return next(
      new AppError('You need to complete KYC verification to list a car', 403)
    );
  }

  req.body.owner = req.user.id;

  const newCar = await Car.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      car: newCar,
    },
  });
});

exports.getAllCars = catchAsync(async (req, res, next) => {
  let filter = {};

  if (req.params.userId) filter = { owner: req.params.userId };
  if (req.user) filter = { owner: req.user.id };

  const cars = await Car.find(filter);

  res.status(200).json({
    status: 'success',
    results: cars.length,
    data: {
      cars,
    },
  });
});

exports.getCar = catchAsync(async (req, res, next) => {
  const car = await Car.findById(req.params.id);

  if (!car) {
    return next(new AppError('No car found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      car,
    },
  });
});

exports.updateCar = catchAsync(async (req, res, next) => {
  const car = await Car.findById(req.params.id);

  if (!car) {
    return next(new AppError('No car found with that ID', 404));
  }

  if (car.owner.id !== req.user.id) {
    return next(new AppError('You can only update your own cars', 403));
  }

  Object.keys(req.body).forEach((key) => {
    car[key] = req.body[key];
  });

  await car.save();

  res.status(200).json({
    status: 'success',
    data: {
      car,
    },
  });
});

exports.deleteCar = catchAsync(async (req, res, next) => {
  const car = await Car.findById(req.params.id);

  if (!car) {
    return next(new AppError('No car found with that ID', 404));
  }

  if (car.owner.id !== req.user.id) {
    return next(new AppError('You can only delete your own cars', 403));
  }

  await Car.findByIdAndUpdate(req.params.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
