const mongoose = require('mongoose');

// Doctor Schema
const DoctorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    specialization: { type: String },
    patients: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Patient' }],
    appointments: [{
        patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
        date: { type: Date },
        notes: { type: String }
    }],
    reports: [{ type: String }] // Links to reports
}, { timestamps: true });

module.exports = mongoose.model('Doctor', DoctorSchema);