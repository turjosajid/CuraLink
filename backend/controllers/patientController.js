const Patient = require('../models/patientModel');
const { uploadFile } = require('../utils/googleDrive');

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

exports.uploadMedicalReport = async (req, res) => {
    try {
        console.log('Starting upload process...');
        
        if (!req.file) {
            console.log('No file received in request');
            return res.status(400).json({ message: 'No file uploaded' });
        }

        console.log('File details:', {
            filename: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size
        });

        if (req.file.mimetype !== 'application/pdf') {
            console.log('Invalid file type:', req.file.mimetype);
            return res.status(400).json({ message: 'Only PDF files are allowed' });
        }

        console.log('Uploading to Google Drive...');
        const { fileId, webViewLink } = await uploadFile(
            req.file.buffer,
            req.file.originalname
        );
        console.log('Google Drive upload successful, fileId:', fileId);

        const patient = await Patient.findOne({ userId: req.user._id });
        if (!patient) {
            console.log('Patient not found for userId:', req.user._id);
            return res.status(404).json({ message: 'Patient not found' });
        }

        const newReport = {
            reportName: req.file.originalname,
            reportUrl: webViewLink,
            date: new Date()
        };

        patient.medicalReports.push(newReport);
        await patient.save();
        console.log('Report saved to patient record');

        res.status(200).json({
            message: 'Report uploaded successfully',
            report: newReport
        });
    } catch (error) {
        console.error('Detailed upload error:', error);
        res.status(500).json({ 
            message: 'Error uploading report',
            error: error.message 
        });
    }
};
