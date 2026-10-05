const Newsletter = require('../models/Newsletter');

const subscribe = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email address is required' });
    }

    const existing = await Newsletter.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'This email is already subscribed' });
    }

    const subscription = await Newsletter.create({ email: email.toLowerCase() });
    res.status(201).json({ success: true, message: 'Subscribed successfully', data: subscription });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  subscribe,
};
