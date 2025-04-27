const express = require('express');
const searchController = require('../controllers/searchController');

const router = express.Router();

router.get('/', searchController.searchCars);
router.get('/filter', searchController.filterSearchResults);

module.exports = router;
