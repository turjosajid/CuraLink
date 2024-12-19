const express = require('express');
const router = express.Router();
const MedicalRecord = require('../models/MedicalRecord');

// Create a new medical record
router.post('/', async (req, res) => {
    try {
        const { patientId, doctorId, diagnosis, prescription, notes, labResults } = req.body;
        const medicalRecord = new MedicalRecord({
            patient: patientId,
            doctor: doctorId,
            diagnosis,
            prescription,
            notes,
            labResults
        });
        await medicalRecord.save();
        res.status(201).json(medicalRecord);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get patient's medical records
router.get('/patient/:patientId', async (req, res) => {
    try {
        const records = await MedicalRecord.find({ patient: req.params.patientId })
            .populate('doctor', 'name specialization')
            .sort({ createdAt: -1 });
        res.json(records);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get specific medical record
router.get('/:id', async (req, res) => {
    try {
        const record = await MedicalRecord.findById(req.params.id)
            .populate('doctor', 'name specialization')
            .populate('patient', 'name email');
        if (!record) {
            return res.status(404).json({ message: 'Medical record not found' });
        }
        res.json(record);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update medical record
router.patch('/:id', async (req, res) => {
    try {
        const updates = req.body;
        const record = await MedicalRecord.findById(req.params.id);
        
        if (!record) {
            return res.status(404).json({ message: 'Medical record not found' });
        }

        Object.keys(updates).forEach(key => {
            if (key !== '_id' && key !== 'patient') {
                record[key] = updates[key];
            }
        });

        await record.save();
        res.json(record);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;
