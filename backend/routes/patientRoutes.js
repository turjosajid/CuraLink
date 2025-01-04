const express = require('express');
const patientController = require('../controllers/patientController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.get('/profile', patientController.getProfile);
router.put('/patients/:id', patientController.updatePatientById);
router.post('/patients/:id/appointments', patientController.scheduleAppointment);
router.put('/patients/:id/appointments/:appointmentId/cancel', patientController.cancelAppointment);
router.post('/', patientController.createPatient);

module.exports = router;
