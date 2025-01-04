const Appointment = require('../models/appointmentModel');

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
