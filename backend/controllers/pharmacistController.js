const Pharmacist = require('../models/pharmacistModel');
const User = require('../models/userModel');

exports.registerPharmacist = async (req, res) => {
  try {
    const pharmacist = await Pharmacist.create({
      userId: req.user._id,
      ...req.body
    });
    await User.findByIdAndUpdate(req.user._id, { role: 'pharmacist' });

    console.log('Pharmacist created:', pharmacist); // Debug log

    res.status(201).json(pharmacist);
  } catch (error) {
    console.error('Error in registerPharmacist:', error); // Debug log
    res.status(400).json({ message: error.message });
  }
};

exports.getPharmacistProfile = async (req, res) => {
  try {
    const pharmacist = await Pharmacist.findOne({ userId: req.user._id })
      .populate('userId', '-password');
    
    if (!pharmacist) {
      return res.status(404).json({ message: 'Pharmacist profile not found' });
    }

    res.status(200).json(pharmacist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updatePharmacistProfile = async (req, res) => {
  try {
    const pharmacist = await Pharmacist.findOneAndUpdate(
      { userId: req.user._id },
      req.body,
      { new: true }
    );
    res.status(200).json(pharmacist);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateInventory = async (req, res) => {
  try {
    const pharmacist = await Pharmacist.findOne({ userId: req.user._id });
    if (!pharmacist) {
      return res.status(404).json({ message: 'Pharmacist not found' });
    }

    pharmacist.inventory = req.body.inventory;
    await pharmacist.save();

    res.status(200).json({ inventory: pharmacist.inventory });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getInventory = async (req, res) => {
  try {
    const pharmacist = await Pharmacist.findOne({ userId: req.user._id });
    if (!pharmacist) {
      return res.status(404).json({ message: 'Pharmacist not found' });
    }

    console.log('Fetched inventory:', pharmacist.inventory); // Debug log

    res.status(200).json({ inventory: pharmacist.inventory });
  } catch (error) {
    console.error('Error in getInventory:', error); // Debug log
    res.status(400).json({ message: error.message });
  }
};

exports.notifyUnavailableMedications = async (req, res) => {
  try {
    const { notifications } = req.body;
    const pharmacist = await Pharmacist.findOne({ userId: req.user._id });
    if (!pharmacist) {
      return res.status(404).json({ message: 'Pharmacist not found' });
    }

    pharmacist.notifications = notifications;
    await pharmacist.save();

    res.status(200).json({ notifications: pharmacist.notifications });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.addDrugToInventory = async (req, res) => {
  try {
    const pharmacist = await Pharmacist.findOne({ userId: req.user._id });
    if (!pharmacist) {
      return res.status(404).json({ message: 'Pharmacist not found' });
    }

    pharmacist.inventory.push(req.body);
    await pharmacist.save();

    res.status(200).json({ inventory: pharmacist.inventory });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.removeDrugFromInventory = async (req, res) => {
  try {
    const pharmacist = await Pharmacist.findOne({ userId: req.user._id });
    if (!pharmacist) {
      return res.status(404).json({ message: 'Pharmacist not found' });
    }

    pharmacist.inventory = pharmacist.inventory.filter(drug => drug._id.toString() !== req.params.drugId);
    await pharmacist.save();

    res.status(200).json({ inventory: pharmacist.inventory });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
