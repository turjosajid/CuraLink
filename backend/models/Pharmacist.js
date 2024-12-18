const mongoose = require('mongoose');

const PharmacistSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    prescriptions: [{
        patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
        details: String
    }],
    inventory: [{
        medication: String,
        stock: Number,
        expirationDate: Date
    }]
}, { timestamps: true });

module.exports = mongoose.model('Pharmacist', PharmacistSchema);
