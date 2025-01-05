const express = require('express');
const patientController = require('../controllers/patientController');
const { protect } = require('../middleware/auth');
const multer = require('multer'); // Import multer

const router = express.Router();
const upload = multer(); // Initialize multer for file uploads

router.use(protect);
router.get('/profile', patientController.getProfile);
router.put('/patients/:id', patientController.updatePatientById);
router.post('/patients/:id/appointments', patientController.scheduleAppointment);
router.put('/patients/:id/appointments/:appointmentId/cancel', patientController.cancelAppointment);
router.post('/', patientController.createPatient);
router.post('/:id/reports', upload.single('report'), patientController.uploadMedicalReport); // Correct the route
router.post('/:id/medical-history', patientController.addMedicalHistory); // Add route for adding medical history
router.delete('/:id/medical-history/:historyId', patientController.removeMedicalHistory); // Add route for removing medical history

module.exports = router;
