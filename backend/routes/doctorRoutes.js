const express = require('express');
const { registerDoctor, getDoctorProfile, updateDoctorProfile, updateTimeSlots, getTimeSlots, addPatient, searchPatients } = require('../controllers/doctorController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

// All doctor routes require authentication
router.use(protect);

router.post('/register', registerDoctor);
router.get('/profile', getDoctorProfile);
router.patch('/profile', updateDoctorProfile);
router.get('/time-slots', getTimeSlots);
router.put('/time-slots', updateTimeSlots);
router.get('/search-patients', searchPatients); // Add this new route
router.post('/patients', addPatient);

module.exports = router;
