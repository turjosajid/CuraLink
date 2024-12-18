const mongoose = require('mongoose');

const PatientSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    healthRecords: [{ type: String }], // Links to health records
    appointments: [{
        doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
        date: { type: Date },
        status: { type: String, enum: ['Scheduled', 'Completed', 'Cancelled'], default: 'Scheduled' }
    }],
    prescriptions: [{
        doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
        drugs: [{
            name: String,
            dosage: String,
            duration: String
        }]
    }]
}, { timestamps: true });

module.exports = mongoose.model('Patient', PatientSchema);
