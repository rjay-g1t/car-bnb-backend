const Car = require('../models/Car');
const catchAsync = require('../utils/catchAsync');

exports.searchCars = catchAsync(async (req, res, next) => {
  const { lat, lng, distance = 10, unit = 'km' } = req.query;

  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  if (lat && lng) {
    const cars = await Car.find({
      'location.coordinates': {
        $geoWithin: { $centerSphere: [[lng, lat], radius] },
      },
    });

    return res.status(200).json({
      status: 'success',
      results: cars.length,
      data: {
        cars,
      },
    });
  }

  const cars = await Car.find();

  res.status(200).json({
    status: 'success',
    results: cars.length,
    data: {
      cars,
    },
  });
});

exports.filterSearchResults = catchAsync(async (req, res, next) => {
  const queryObj = { ...req.query };
  const excludedFields = ['page', 'sort', 'limit', 'fields'];
  excludedFields.forEach((el) => delete queryObj[el]);

  let queryStr = JSON.stringify(queryObj);
  queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

  let query = Car.find(JSON.parse(queryStr));

  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }

  if (req.query.fields) {
    const fields = req.query.fields.split(',').join(' ');
    query = query.select(fields);
  } else {
    query = query.select('-__v');
  }

  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 100;
  const skip = (page - 1) * limit;

  query = query.skip(skip).limit(limit);

  const cars = await query;

  res.status(200).json({
    status: 'success',
    results: cars.length,
    data: {
      cars,
    },
  });
});
