const express = require('express');
const router = express.Router();
const { getStylistRecommendation } = require('../controllers/stylistController');

router.post('/recommend', getStylistRecommendation);

module.exports = router;
