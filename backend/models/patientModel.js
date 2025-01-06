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
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
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
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        auto: true,
      },
      date: {
        type: Date,
        required: true,
      },
      description: {
        type: String,
        required: true,
      },
      drugs: [
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
