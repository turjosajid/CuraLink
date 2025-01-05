const express = require("express");
const {
  getUpcomingAppointments,
  bookAppointment,
  getPatientAppointments,
} = require("../controllers/appointmentController");
const { protect } = require("../middleware/auth");


const router = express.Router();

// All appointment routes require authentication
router.use(protect);


router.get("/", getUpcomingAppointments);
router.post("/book", bookAppointment);
router.get("/patient", getPatientAppointments);

module.exports = router;
