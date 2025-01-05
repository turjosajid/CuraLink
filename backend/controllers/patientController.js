const Patient = require('../models/patientModel');

// Create a new patient
exports.createPatient = async (req, res) => {
    try {
        const patient = new Patient(req.body);
        await patient.save();
        res.status(201).send(patient);
    } catch (error) {
        res.status(400).send(error);
    }
};

// Get a patient by ID
exports.getPatientById = async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id);
        if (!patient) {
            return res.status(404).send();
        }
        res.send(patient);
    } catch (error) {
        res.status(500).send(error);
    }
};

// Update a patient by ID
exports.updatePatientById = async (req, res) => {
    try {
        const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!patient) {
            return res.status(404).send();
        }
        res.send(patient);
    } catch (error) {
        res.status(400).send(error);
    }
};

// Delete a patient by ID
exports.deletePatientById = async (req, res) => {
    try {
        const patient = await Patient.findByIdAndDelete(req.params.id);
        if (!patient) {
            return res.status(404).send();
        }
        res.send(patient);
    } catch (error) {
        res.status(500).send(error);
    }
};

// Schedule an appointment
exports.scheduleAppointment = async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id);
        if (!patient) {
            return res.status(404).send();
        }
        patient.appointments.push(req.body);
        await patient.save();
        res.send(patient);
    } catch (error) {
        res.status(400).send(error);
    }
};

// Cancel an appointment
exports.cancelAppointment = async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id);
        if (!patient) {
            return res.status(404).send();
        }
        const appointment = patient.appointments.id(req.params.appointmentId);
        if (!appointment) {
            return res.status(404).send();
        }
        appointment.status = 'cancelled';
        await patient.save();
        res.send(patient);
    } catch (error) {
        res.status(400).send(error);
    }
};

// Add getProfile method
exports.getProfile = async (req, res) => {
    try {
        let patient = await Patient.findOne({ userId: req.user._id }).populate('userId', 'name email');
        
        // If patient profile doesn't exist, create one automatically
        if (!patient) {
            patient = new Patient({
                userId: req.user._id,
                phone: req.user.phone || '',
                address: req.user.address || {}
            });
            await patient.save();
            patient = await Patient.findOne({ userId: req.user._id }).populate('userId', 'name email');
        }
        
        const profileData = {
            ...patient.toObject(),
            name: patient.userId.name,
            email: patient.userId.email
        };
        
        res.status(200).json(profileData);
    } catch (error) {
        res.status(500).json({ 
            message: 'Error fetching profile',
            error: error.message 
        });
    }
};
