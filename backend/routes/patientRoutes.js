const express = require('express');
const multer = require('multer');
const patientController = require('../controllers/patientController');
const { protect } = require('../middleware/auth');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(protect);
router.get('/profile', patientController.getProfile);
router.put('/patients/:id', patientController.updatePatientById);
router.post('/patients/:id/appointments', patientController.scheduleAppointment);
router.put('/patients/:id/appointments/:appointmentId/cancel', patientController.cancelAppointment);
router.post('/upload-report', upload.single('file'), patientController.uploadMedicalReport);

module.exports = router;
