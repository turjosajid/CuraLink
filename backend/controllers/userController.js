const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const Pharmacist = require('../models/pharmacistModel');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: parseInt(process.env.JWT_EXPIRES_IN) || 86400 // 24 hours in seconds
  });
};

exports.register = async (req, res) => {
  try {
    const user = await User.create(req.body);

    if (user.role === 'pharmacist') {
      await Pharmacist.create({ userId: user._id });
    }

    const token = signToken(user._id);
    res.status(201).json({ token, user });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'Email already exists. Please use a different email.' });
    } else {
      res.status(400).json({ message: error.message });
    }
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const token = signToken(user._id);
    res.status(200).json({ token, user });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json(user);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
