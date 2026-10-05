const bcrypt = require('bcrypt');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();
const findUserByEmail = (email) => User.findOne({
  email: new RegExp(`^${email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i'),
});

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const normalizedEmail = normalizeEmail(email);

    const existingUser = await findUserByEmail(normalizedEmail);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const createdUser = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role: 'customer'
    });

    res.status(201).json({
      _id: createdUser._id,
      name: createdUser.name,
      email: createdUser.email,
      role: createdUser.role,
      token: generateToken(createdUser._id)
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await findUserByEmail(normalizeEmail(email));
    if (!user || !user.password) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const googleSignIn = async (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const { credential } = req.body || {};

  if (typeof credential !== 'string' || credential.length > 10000) {
    return res.status(400).json({ message: 'Invalid Google credential' });
  }
  if (!clientId) {
    return res.status(503).json({ message: 'Google sign-in is not configured' });
  }

  let profile;
  try {
    const ticket = await new OAuth2Client(clientId).verifyIdToken({
      idToken: credential,
      audience: clientId,
    });
    profile = ticket.getPayload();
  } catch {
    return res.status(401).json({ message: 'Google sign-in could not be verified' });
  }

  if (!profile?.sub || profile.email_verified !== true || !profile.email) {
    return res.status(401).json({ message: 'Google sign-in could not be verified' });
  }

  const email = normalizeEmail(profile.email);
  try {
    let user = await findUserByEmail(email);
    if (!user) {
      try {
        user = await User.create({
          name: profile.name?.trim() || email.split('@')[0],
          email,
          role: 'customer',
        });
      } catch (error) {
        if (error.code !== 11000) throw error;
        user = await findUserByEmail(email);
        if (!user) throw error;
      }
    }

    if (user.role !== 'customer') {
      return res.status(403).json({ message: 'Customer account required' });
    }

    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch {
    return res.status(500).json({ message: 'Unable to sign in with Google' });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  register,
  login,
  googleSignIn,
  getMe
};
