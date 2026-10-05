const mongoose = require('mongoose');

const connectDB = async () => {
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI is not configured');
  const isFallbackAllowed = process.env.ALLOW_DB_FALLBACK === 'true' || process.env.ALLOW_DB_FALLBACK === '1';
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    console.log('MongoDB connected successfully.');
    return conn;
  } catch (err) {
    const sanitizedMsg = (err.message || 'connection failed').replace(/mongodb(\+srv)?:\/\/[^\s]+/gi, '[REDACTED_URI]');
    console.error('MongoDB connection failed:', sanitizedMsg);
    if (!isFallbackAllowed) {
      throw new Error('MongoDB connection failed. Check MONGO_URI and database access.');
    }
    console.warn('ALLOW_DB_FALLBACK is enabled; proceeding with local catalog fallback.');
    return null;
  }
};

module.exports = connectDB;
