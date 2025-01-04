const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  medicationName: {
    type: String,
    required: true
  },
  stockLevel: {
    type: Number,
    required: true
  },
  expirationDate: {
    type: Date,
    required: true
  }
});

const pharmacistSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  inventory: [inventorySchema],
  notifications: [{
    type: String
  }]
}, { timestamps: true });

module.exports = mongoose.model('Pharmacist', pharmacistSchema);
