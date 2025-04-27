const User = require('../models/User');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.submitKYC = catchAsync(async (req, res, next) => {
  const { idProof, addressProof, drivingLicense } = req.body;

  if (!idProof || !addressProof || !drivingLicense) {
    return next(new AppError('Please provide all required documents', 400));
  }

  const kycDocuments = {
    idProof,
    addressProof,
    drivingLicense,
  };

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { kycDocuments, kycStatus: 'pending' },
    { new: true }
  );

  res.status(200).json({
    status: 'success',
    message: 'KYC documents submitted successfully',
    data: {
      kycStatus: user.kycStatus,
    },
  });
});

exports.getKYCStatus = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      kycStatus: user.kycStatus,
    },
  });
});

exports.verifyKYC = catchAsync(async (req, res, next) => {
  const { userId, status } = req.body;

  if (!userId || !['verified', 'rejected'].includes(status)) {
    return next(new AppError('Please provide valid user ID and status', 400));
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { kycStatus: status },
    { new: true }
  );

  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    message: `KYC ${
      status === 'verified' ? 'verified' : 'rejected'
    } successfully`,
    data: {
      kycStatus: user.kycStatus,
    },
  });
});
