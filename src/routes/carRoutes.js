const express = require('express');
const carController = require('../controllers/carController');
const authController = require('../controllers/authController');

const router = express.Router();

router.get('/:id', carController.getCar);

router.use(authController.protect);

router.route('/').get(carController.getAllCars).post(carController.createCar);

router
  .route('/:id')
  .put(carController.updateCar)
  .delete(carController.deleteCar);

module.exports = router;
