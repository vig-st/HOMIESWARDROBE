const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  getProductReviews,
  createProductReview,
} = require('../controllers/productController');

router.get('/', getProducts);

router.get('/:id', getProductById);

router.route('/:id/reviews')
  .get(getProductReviews)
  .post(require('../middleware/authMiddleware').protect, createProductReview);

module.exports = router;
