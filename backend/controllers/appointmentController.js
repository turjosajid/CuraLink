const Appointment = require("../models/appointmentModel");

exports.getUpcomingAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({
      doctorId: req.user._id,
      date: { $gte: new Date() },
    })
      .populate("patientId", "name")
      .sort({ date: 1 });

    res.status(200).json({ appointments });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.bookAppointment = async (req, res) => {
  try {
    const { doctorId, date, startTime, endTime } = req.body;
    const appointment = await Appointment.create({
      doctorId,
      patientId: req.user._id,
      date,
      startTime,
      endTime,
      status: "Scheduled",
    });
    res.status(201).json(appointment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getPatientAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({
      patientId: req.user._id,
    })
      .populate({
        path: "doctorId",
        populate: {
          path: "userId",
          select: "name",
        },
      })


exports.getUpcomingAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ doctorId: req.user._id, date: { $gte: new Date() } })
      .populate('patientId', 'name')

      .sort({ date: 1 });

    res.status(200).json({ appointments });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
