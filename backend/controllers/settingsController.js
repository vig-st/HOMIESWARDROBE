const StoreSettings = require('../models/StoreSettings');

const getSettings = async (req, res) => {
  try {
    let settings = await StoreSettings.findOne();
    if (!settings) {
      settings = await StoreSettings.create({
        storeName: 'Homies Wardrobe',
        contactEmail: 'support@homieswardrobe.com',
        supportPhone: '+91 98765 43210',
        currency: 'INR',
        shippingFee: 50,
        freeShippingMinimum: 999,
        taxRate: 18,
      });
    }
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getSettings,
};
