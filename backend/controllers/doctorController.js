const Doctor = require("../models/doctorModel");
const User = require("../models/userModel");

const Appointment = require("../models/appointmentModel");
const Patient = require("../models/patientModel");


exports.registerDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.create({
      userId: req.user._id,
      ...req.body,
    });
    await User.findByIdAndUpdate(req.user._id, { role: "doctor" });
    res.status(201).json(doctor);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getDoctorProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id })
      .populate("userId", "-password")
      .populate("patients", "name email");

    if (!doctor) {


      if (req.user.role === "doctor") {
        return res.status(404).json({
          message: "Doctor profile not found. Please complete registration.",
          status: "PROFILE_NOT_FOUND",
        });
      }
      return res.status(403).json({
        message: "Not authorized as doctor",
        status: "NOT_AUTHORIZED",
      });
    }


    console.log("Doctor profile found:", doctor); // Debug log
    res.status(200).json(doctor);
  } catch (error) {
    console.error("Error in getDoctorProfile:", error); // Debug log

    res.status(500).json({
      message: "Error fetching doctor profile",
      error: error.message,
    });
  }
};

exports.updateDoctorProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findOneAndUpdate(
      { userId: req.user._id },
      req.body,
      { new: true }
    );
    res.status(200).json(doctor);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateTimeSlots = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    doctor.timeSlots = req.body.timeSlots;
    await doctor.save();

    res.status(200).json({ timeSlots: doctor.timeSlots });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getTimeSlots = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    res.status(200).json({ timeSlots: doctor.timeSlots });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.searchPatients = async (req, res) => {
  try {
    const { search } = req.query;
    const query = { role: "patient" };


    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const patients = await User.find(query)
      .select("name email")
      .sort({ name: 1 });

    res.status(200).json(patients);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.addPatient = async (req, res) => {
  try {
    const { patientId } = req.body;


    const patient = await User.findOne({ _id: patientId, role: "patient" });
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (doctor.patients.includes(patientId)) {
      return res
        .status(400)
        .json({ message: "Patient already added to your list" });
    }

    doctor.patients.push(patientId);
    await doctor.save();

    res.status(200).json({
      message: "Patient added successfully",
      patient: {
        id: patient._id,
        name: patient.name,
        email: patient.email,
      },
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.removePatient = async (req, res) => {
  try {
    const { patientId } = req.params;


    const patient = await User.findOne({ _id: patientId, role: "patient" });
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    const doctor = await Doctor.findOne({ userId: req.user._id });
    doctor.patients = doctor.patients.filter((p) => p.toString() !== patientId);
    await doctor.save();

    res.status(200).json({
      message: "Patient removed successfully",
      patientId,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getUpcomingAppointments = async (req, res) => {
  try {

    const doctorId = req.query.doctorId;
    const appointments = await Appointment.find({
      doctorId,

      date: { $gte: new Date() },
    })
      .populate("patientId", "name")
      .sort({ date: 1 });

    res.status(200).json({ appointments });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.toggleAvailability = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    doctor.isAvailable = req.body.isAvailable;
    await doctor.save();

    res.status(200).json({ isAvailable: doctor.isAvailable });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getMedicalReports = async (req, res) => {
  try {
    const { patientId } = req.params;



    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor.patients.includes(patientId)) {
      return res
        .status(403)
        .json({ message: "Patient not found in your list" });
    }


    const patient = await Patient.findOne({ userId: patientId }).select(
      "medicalReports"
    );
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    res.status(200).json({ medicalReports: patient.medicalReports });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


exports.getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({ isAvailable: true })
      .populate("userId", "name email")
      .populate("timeSlots")
      .select("specialization timeSlots");
    res.status(200).json(doctors);
  } catch (error) {
    res.status(400).json({ message: error.message });

exports.deleteAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    // Check if the appointment exists
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Delete the appointment
    await Appointment.findByIdAndDelete(appointmentId);

    res.status(200).json({ message: "Appointment deleted successfully" });
  } catch (error) {
    console.error("Error deleting appointment:", error);
    res.status(500).json({ message: "Internal server error" });

  }
};
