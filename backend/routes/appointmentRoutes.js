const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');

// Book a new appointment
router.post('/book', async (req, res) => {
    try {
        const { patientId, doctorId, dateTime, reason } = req.body;
        const appointment = new Appointment({
            patient: patientId,
            doctor: doctorId,
            dateTime,
            reason,
            status: 'scheduled'
        });
        await appointment.save();
        res.status(201).json(appointment);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get appointments for a doctor
router.get('/doctor/:doctorId', async (req, res) => {
    try {
        const appointments = await Appointment.find({ doctor: req.params.doctorId })
            .populate('patient', 'name email')
            .sort({ dateTime: 1 });
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get appointments for a patient
router.get('/patient/:patientId', async (req, res) => {
    try {
        const appointments = await Appointment.find({ patient: req.params.patientId })
            .populate('doctor', 'name specialization')
            .sort({ dateTime: 1 });
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update appointment status (cancel/reschedule)
router.patch('/:id', async (req, res) => {
    try {
        const { status, dateTime } = req.body;
        const appointment = await Appointment.findById(req.params.id);
        
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        if (status) appointment.status = status;
        if (dateTime) appointment.dateTime = dateTime;

        await appointment.save();
        res.json(appointment);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;
