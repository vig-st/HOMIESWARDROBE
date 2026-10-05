const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
  },
  slug: {
    type: String,
    trim: true,
    index: true,
  },
  sku: {
    type: String,
    trim: true,
    index: true,
  },
  description: {
    type: String,
    default: '',
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: 0,
  },
  discountPrice: {
    type: Number,
    default: 0,
    min: 0,
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
  },
  
  product_collection: {
    type: String,
    default: '',
  },
  brand: {
    type: String,
    default: '',
  },
  sizes: {
    type: [String],
    default: [],
  },
  colors: {
    type: [String],
    default: [],
  },
  stock: {
    type: Number,
    default: 0,
    min: 0,
  },
  images: {
    type: [String],
    default: [],
  },
  featured: {
    type: Boolean,
    default: false,
  },
  bestSeller: {
    type: Boolean,
    default: false,
  },
  newArrival: {
    type: Boolean,
    default: false,
  },
  gender: {
    type: String,
    enum: ['men', 'women', 'unisex'],
    required: true,
  },
  style: {
    type: String,
    default: 'Streetwear',
  },
  occasion: {
    type: [String],
    default: ['Casual', 'College'],
  },
  season: {
    type: String,
    default: 'All Season',
  },
  fit: {
    type: String,
    default: 'Oversized',
  },
  tags: {
    type: [String],
    default: [],
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  numReviews: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// No .join() calls here!

module.exports = mongoose.model('Product', productSchema);