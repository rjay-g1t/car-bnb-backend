const Booking = require('../models/Booking');
const Car = require('../models/Car');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.createBooking = catchAsync(async (req, res, next) => {
  if (!req.body.car) req.body.car = req.params.carId;
  if (!req.body.renter) req.body.renter = req.user.id;

  const car = await Car.findById(req.body.car);

  if (!car) {
    return next(new AppError('No car found with that ID', 404));
  }

  req.body.owner = car.owner._id;

  const { startDate, endDate } = req.body;

  if (!startDate || !endDate) {
    return next(new AppError('Please provide start and end dates', 400));
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (start >= end) {
    return next(new AppError('End date must be after start date', 400));
  }

  if (start < new Date()) {
    return next(new AppError('Start date must be in the future', 400));
  }

  const overlappingBookings = await Booking.find({
    car: car._id,
    status: { $ne: 'cancelled' },
    $or: [{ startDate: { $lte: end }, endDate: { $gte: start } }],
  });

  if (overlappingBookings.length > 0) {
    return next(
      new AppError('Car is not available for the selected dates', 400)
    );
  }

  req.body.totalPrice = Booking.calculateTotalPrice(
    car.dailyRate,
    startDate,
    endDate
  );

  const newBooking = await Booking.create(req.body);

  car.availabilityCalendar.push({
    startDate,
    endDate,
    isBooked: true,
  });

  await car.save();

  res.status(201).json({
    status: 'success',
    data: {
      booking: newBooking,
    },
  });
});

exports.getBooking = catchAsync(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    return next(new AppError('No booking found with that ID', 404));
  }

  if (req.user.id !== booking.renter.id && req.user.id !== booking.owner.id) {
    return next(
      new AppError('You are not authorized to view this booking', 403)
    );
  }

  res.status(200).json({
    status: 'success',
    data: {
      booking,
    },
  });
});

exports.updateBooking = catchAsync(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    return next(new AppError('No booking found with that ID', 404));
  }

  if (req.user.id !== booking.renter.id && req.user.id !== booking.owner.id) {
    return next(
      new AppError('You are not authorized to update this booking', 403)
    );
  }

  if (booking.status === 'cancelled') {
    return next(new AppError('Cannot update a cancelled booking', 400));
  }

  if (booking.paymentStatus === 'paid' && req.body.status === 'cancelled') {
    return next(new AppError('Cannot cancel a paid booking', 400));
  }

  if (req.body.status === 'cancelled') {
    booking.cancellationReason = req.body.cancellationReason;
  }

  booking.status = req.body.status || booking.status;
  await booking.save();

  res.status(200).json({
    status: 'success',
    data: {
      booking,
    },
  });
});

exports.cancelBooking = catchAsync(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    return next(new AppError('No booking found with that ID', 404));
  }

  if (req.user.id !== booking.renter.id) {
    return next(new AppError('You can only cancel your own bookings', 403));
  }

  if (booking.status === 'cancelled') {
    return next(new AppError('Booking is already cancelled', 400));
  }

  if (booking.status === 'completed') {
    return next(new AppError('Cannot cancel a completed booking', 400));
  }

  const car = await Car.findById(booking.car);

  booking.status = 'cancelled';
  booking.cancellationReason = req.body.cancellationReason;
  await booking.save();

  const calendarIndex = car.availabilityCalendar.findIndex(
    (entry) =>
      entry.startDate.getTime() === new Date(booking.startDate).getTime() &&
      entry.endDate.getTime() === new Date(booking.endDate).getTime()
  );

  if (calendarIndex >= 0) {
    car.availabilityCalendar.splice(calendarIndex, 1);
    await car.save();
  }

  res.status(200).json({
    status: 'success',
    data: {
      booking,
    },
  });
});
