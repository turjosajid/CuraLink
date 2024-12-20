const mongoose = require('mongoose');

const SlotSchema = new mongoose.Schema({
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    isAvailable: { type: Boolean, default: true }
}, { _id: false });

const AppointmentSlotSchema = new mongoose.Schema({
    day: {
        type: String,
        required: true,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    },
    slots: [SlotSchema]
}, { _id: false });

const DoctorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    specialization: { type: String },
    education: [{
        degree: { type: String },
        institution: { type: String },
        year: { type: String }
    }],
    experience: { type: Number },
    about: { type: String },
    languages: [{ type: String }],
    clinicAddress: { type: String },
    contactNumber: { type: String },
    patients: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Patient' }],
    appointments: [{
        patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
        date: { type: Date },
        notes: { type: String }
    }],
    reports: [{ type: String }], // Links to reports
    appointmentSlots: [AppointmentSlotSchema]
}, { timestamps: true });

module.exports = mongoose.model('Doctor', DoctorSchema);