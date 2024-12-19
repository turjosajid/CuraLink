const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true
    },
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
        required: true
    },
    diagnosis: {
        type: String,
        required: true
    },
    prescription: [{
        medication: String,
        dosage: String,
        frequency: String,
        duration: String
    }],
    notes: {
        type: String
    },
    labResults: [{
        testName: String,
        result: String,
        date: Date,
        attachments: [String] // URLs to uploaded files
    }],
    attachments: [String], // URLs to any additional uploaded files
}, {
    timestamps: true
});

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);
