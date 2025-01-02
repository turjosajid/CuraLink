const Doctor = require('../models/doctorModel');
const User = require('../models/userModel');

exports.registerDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.create({
      userId: req.user._id,
      ...req.body
    });
    await User.findByIdAndUpdate(req.user._id, { role: 'doctor' });
    res.status(201).json(doctor);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getDoctorProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id })
      .populate('userId', '-password')
      .populate('patients', 'name email');
    
    if (!doctor) {
      // Check if user is a doctor but profile not created
      if (req.user.role === 'doctor') {
        return res.status(404).json({ 
          message: 'Doctor profile not found. Please complete registration.',
          status: 'PROFILE_NOT_FOUND'
        });
      }
      return res.status(403).json({ 
        message: 'Not authorized as doctor',
        status: 'NOT_AUTHORIZED'
      });
    }

    console.log('Doctor profile found:', doctor); // Debug log
    res.status(200).json(doctor);
  } catch (error) {
    console.error('Error in getDoctorProfile:', error); // Debug log
    res.status(500).json({ 
      message: 'Error fetching doctor profile',
      error: error.message 
    });
  }
};

exports.updateDoctorProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findOneAndUpdate(
      { userId: req.user._id },
      req.body,
      { new: true }
    );
    res.status(200).json(doctor);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
