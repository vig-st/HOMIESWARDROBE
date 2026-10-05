const mongoose = require('mongoose');

const storeSettingsSchema = new mongoose.Schema(
  {
    storeName: {
      type: String,
      default: 'Homies Wardrobe',
    },
    contactEmail: {
      type: String,
      default: 'support@homieswardrobe.com',
    },
    supportPhone: {
      type: String,
      default: '+91 98765 43210',
    },
    currency: {
      type: String,
      default: 'INR',
    },
    shippingFee: {
      type: Number,
      default: 50,
    },
    freeShippingMinimum: {
      type: Number,
      default: 999,
    },
    taxRate: {
      type: Number,
      default: 18,
    },
  },
  {
    timestamps: true,
  }
);

const StoreSettings = mongoose.model('StoreSettings', storeSettingsSchema);
module.exports = StoreSettings;
