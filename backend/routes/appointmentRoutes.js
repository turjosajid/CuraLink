const express = require('express');
const { getUpcomingAppointments } = require('../controllers/appointmentController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All appointment routes require authentication
router.use(protect);

router.get('/', getUpcomingAppointments);

module.exports = router;
