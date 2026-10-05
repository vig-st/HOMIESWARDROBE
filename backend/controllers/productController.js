const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Product = require('../models/Product');
const Review = require('../models/Review');
const fallbackProducts = require('../product');

// Helper function to safely parse array fields
const parseArrayField = (value) => {
  if (Array.isArray(value)) return value;
  if (value == null || value === '') return [];
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return value.split(',').map((item) => item.trim()).filter(Boolean);
    }
  }
  return [];
};

const getAvailableProductImages = (productImages = []) => {
  const existingUploadImages = [];
  const fallbackImages = [];

  for (const image of productImages) {
    if (!image || typeof image !== 'string') continue;

    if (image.startsWith('/uploads/')) {
      const absoluteImagePath = path.join(__dirname, '..', image.replace(/^\//, ''));
      if (fs.existsSync(absoluteImagePath)) {
        existingUploadImages.push(image);
      }
    } else {
      fallbackImages.push(image);
    }
  }

  return existingUploadImages.length > 0 ? existingUploadImages : fallbackImages;
};

// Helper function to map product for response
const mapProduct = (product) => ({
  id: (product._id || product.id || '').toString(),
  _id: (product._id || product.id || '').toString(),
  name: product.name,
  slug: product.slug || '',
  sku: product.sku || '',
  description: product.description,
  price: Number(product.price),
  discountPrice: Number(product.discountPrice || product.discount_price || 0),
  category: product.category,
  collection: product.product_collection || product.collections || '',
  productCollection: product.product_collection || product.collections || '',
  brand: product.brand || '',
  sizes: product.sizes || [],
  colors: product.colors || [],
  stock: Number(product.countInStock || product.stock || 0),
  images: getAvailableProductImages(
    Array.isArray(product.images)
      ? product.images.map(img => typeof img === 'string' ? img : (img.url || ''))
      : []
  ),
  featured: Boolean(product.featured),
  bestSeller: Boolean(product.bestSeller || product.best_seller),
  newArrival: Boolean(product.newArrival || product.new_arrival),
  gender: product.gender || 'unisex',
  style: product.style || 'Streetwear',
  occasion: product.occasion || ['Casual', 'College'],
  season: product.season || 'All Season',
  fit: product.fit || 'Oversized',
  tags: product.tags || [],
  rating: Number(product.rating || 4.5),
  numReviews: Number(product.numReviews || 10),
  createdAt: product.createdAt || new Date().toISOString(),
  updatedAt: product.updatedAt || new Date().toISOString(),
});

// @desc    Get all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  const isFallbackAllowed = process.env.ALLOW_DB_FALLBACK === 'true' || process.env.ALLOW_DB_FALLBACK === '1';
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const skip = (page - 1) * limit;

    let products = [];
    let total = 0;
    let dbQuerySucceeded = false;

    const filter = {};
    if (req.query.category) {
      filter.category = new RegExp(`^${req.query.category}$`, 'i');
    }
    if (req.query.collection) {
      filter.$or = [{ product_collection: new RegExp(req.query.collection, 'i') }];
    }
    if (req.query.gender) {
      const g = req.query.gender.toLowerCase();
      filter.gender = { $in: [new RegExp(`^${g}$`, 'i'), /^unisex$/i] };
    }
    if (req.query.featured === 'true') {
      filter.featured = true;
    }
    if (req.query.bestSeller === 'true') {
      filter.$or = [{ bestSeller: true }, { best_seller: true }];
    }

    try {
      if (mongoose.connection.readyState === 1) {
        products = await Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit);
        total = await Product.countDocuments(filter);
        dbQuerySucceeded = true;
      }
    } catch (dbError) {
      const sanitizedMsg = (dbError.message || 'Database query error').replace(/mongodb(\+srv)?:\/\/[^\s]+/gi, '[REDACTED_URI]');
      console.error('Database query error in getProducts:', sanitizedMsg);
    }

    if (!dbQuerySucceeded) {
      if (isFallbackAllowed) {
        let memoryList = fallbackProducts.map((p, idx) => ({
          ...p,
          _id: p._id || `local_${idx + 1}`,
          id: p._id || `local_${idx + 1}`,
        }));

        if (req.query.category) {
          memoryList = memoryList.filter(p => (p.category || '').toLowerCase() === req.query.category.toLowerCase());
        }
        if (req.query.gender) {
          const g = req.query.gender.toLowerCase();
          memoryList = memoryList.filter(p => (p.gender || '').toLowerCase() === g || (p.gender || '').toLowerCase() === 'unisex');
        }
        if (req.query.featured === 'true') {
          memoryList = memoryList.filter(p => p.featured);
        }
        if (req.query.bestSeller === 'true') {
          memoryList = memoryList.filter(p => p.bestSeller || p.best_seller);
        }

        total = memoryList.length;
        products = memoryList.slice(skip, skip + limit);
      } else {
        return res.status(503).json({
          success: false,
          message: 'Database service unavailable',
        });
      }
    }

    res.json({
      success: true,
      data: products.map(mapProduct),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to fetch products',
    });
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  const isFallbackAllowed = process.env.ALLOW_DB_FALLBACK === 'true' || process.env.ALLOW_DB_FALLBACK === '1';
  try {
    let product = null;
    let dbQuerySucceeded = false;

    try {
      if (mongoose.connection.readyState === 1) {
        product = await Product.findById(req.params.id);
        dbQuerySucceeded = true;
      }
    } catch (dbErr) {
      const sanitizedMsg = (dbErr.message || 'Database query error').replace(/mongodb(\+srv)?:\/\/[^\s]+/gi, '[REDACTED_URI]');
      console.error('Database query error in getProductById:', sanitizedMsg);
    }

    if (!dbQuerySucceeded) {
      if (isFallbackAllowed) {
        const local = fallbackProducts.find((p, idx) => (p._id || `local_${idx + 1}`) === req.params.id || p.sku === req.params.id) || fallbackProducts[0];
        if (local) {
          product = { ...local, _id: local._id || req.params.id };
        }
      } else {
        return res.status(503).json({
          success: false,
          message: 'Database service unavailable',
        });
      }
    }

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.json({
      success: true,
      data: mapProduct(product),
    });
  } catch (error) {
    console.error('Get product by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to fetch product',
    });
  }
};

// ==================== REVIEW CONTROLLERS ====================

// @desc    Get all reviews for a product
// @route   GET /api/products/:id/reviews
// @access  Public
const getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.id })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    // Get rating distribution
    const ratingCounts = {
      1: 0, 2: 0, 3: 0, 4: 0, 5: 0
    };
    reviews.forEach(review => {
      if (ratingCounts[review.rating] !== undefined) {
        ratingCounts[review.rating]++;
      }
    });

    res.json({
      success: true,
      data: reviews,
      ratingCounts,
      totalReviews: reviews.length,
    });
  } catch (error) {
    console.error('Get product reviews error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// @desc    Create a review for a product
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const productId = req.params.id;

    // Validate input
    if (!rating || !comment) {
      return res.status(400).json({ 
        success: false, 
        message: 'Rating and comment are required' 
      });
    }

    const numericRating = Number(rating);
    if (numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ 
        success: false, 
        message: 'Rating must be between 1 and 5' 
      });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: 'Product not found' 
      });
    }

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({ 
      product: productId, 
      user: req.user._id 
    });
    
    if (existingReview) {
      return res.status(400).json({ 
        success: false, 
        message: 'You have already reviewed this product' 
      });
    }

    // Create review
    const review = await Review.create({
      product: productId,
      user: req.user._id,
      rating: numericRating,
      comment,
    });

    // Recalculate product rating & numReviews
    const allReviews = await Review.find({ product: productId });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    product.rating = Number(avgRating.toFixed(1));
    product.numReviews = allReviews.length;
    await product.save();

    // Populate user info
    await review.populate('user', 'name email');

    res.status(201).json({
      success: true,
      data: review,
      productRating: product.rating,
      numReviews: product.numReviews,
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// @desc    Update a review
// @route   PUT /api/reviews/:id
// @access  Private
const updateReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ 
        success: false, 
        message: 'Review not found' 
      });
    }

    // Check if user owns the review
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to update this review' 
      });
    }

    // Update review
    if (rating) review.rating = Number(rating);
    if (comment) review.comment = comment;
    await review.save();

    // Recalculate product rating
    const allReviews = await Review.find({ product: review.product });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await Product.findByIdAndUpdate(review.product, {
      rating: Number(avgRating.toFixed(1)),
      numReviews: allReviews.length,
    });

    await review.populate('user', 'name email');

    res.json({
      success: true,
      data: review,
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ 
        success: false, 
        message: 'Review not found' 
      });
    }

    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to delete this review' 
      });
    }

    await review.deleteOne();

    // Recalculate product rating
    const allReviews = await Review.find({ product: review.product });
    const avgRating = allReviews.length > 0 
      ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length 
      : 0;

    await Product.findByIdAndUpdate(review.product, {
      rating: Number(avgRating.toFixed(1)),
      numReviews: allReviews.length,
    });

    res.json({
      success: true,
      message: 'Review removed successfully',
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

module.exports = {
  getProducts,
  getProductById,
  getProductReviews,
  createProductReview,
  updateReview,
  deleteReview,
};
