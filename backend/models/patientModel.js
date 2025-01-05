const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  phone: {
    type: String,
    // required: true
  },
  appointments: [
    {
      date: {
        type: Date,
        required: true,
      },
      status: {
        type: String,
        enum: ["scheduled", "cancelled", "completed"],
        default: "scheduled",
      },
      reminderSent: {
        type: Boolean,
        default: false,
      },
    },
  ],
  medicalHistory: [
    {
      date: {
        type: Date,
        required: true,
      },
      description: {
        type: String,
        required: true,
      },
      prescriptions: [
        {
          name: {
            type: String,
            required: true,
          },
          dosage: {
            type: String,
            required: true,
          },
        },
      ],
    },
  ],
  medicalReports: [
    {
      reportName: {
        type: String,
        required: true,
      },
      reportUrl: {
        type: String,
        required: true,
      },
      date: {
        type: Date,
        required: true,
      },
    },
  ],
});

const Patient = mongoose.model("Patient", patientSchema);
module.exports = Patient;
