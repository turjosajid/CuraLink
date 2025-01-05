const express = require("express");
const {
  registerDoctor,
  getDoctorProfile,
  updateDoctorProfile,
  updateTimeSlots,
  getTimeSlots,
  addPatient,
  searchPatients,
  removePatient,
  getUpcomingAppointments,
  toggleAvailability,
  getMedicalReports,
  getAllDoctors,
} = require("../controllers/doctorController");
const { protect, restrictTo } = require("../middleware/auth");

const router = express.Router();

// All doctor routes require authentication
router.use(protect);

router.post("/register", registerDoctor);
router.get("/profile", getDoctorProfile);
router.patch("/profile", updateDoctorProfile);
router.get("/time-slots", getTimeSlots);
router.put("/time-slots", updateTimeSlots);
router.get("/search-patients", searchPatients); // Add this new route
router.post("/patients", addPatient);
router.delete("/patients/:patientId", removePatient); // Add this new route
router.get("/appointments", getUpcomingAppointments); // Add this new route
router.patch("/availability", toggleAvailability); // Add this new route
router.get("/patients/:patientId/medical-reports", getMedicalReports); // Add this new route
router.get("/all-doctors", getAllDoctors); // Add this new route

module.exports = router;
