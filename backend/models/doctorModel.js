const mongoose = require("mongoose");

const timeSlotSchema = new mongoose.Schema({
  day: {
    type: String,
    required: true,
    enum: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],
  },
  startTime: {
    type: String,
    required: true,
  },
  endTime: {
    type: String,
    required: true,
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
});

const doctorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    specialization: {
      type: String,
      required: true,
    },
    license: {
      type: String,
      required: true,
      unique: true,
    },
    experience: {
      type: Number,
      required: true,
    },
    availability: [
      {
        day: String,
        startTime: String,
        endTime: String,
      },
    ],
    patients: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    education: [
      {
        degree: String,
        institute: String,
        year: String,
      },
    ],
    certificates: [
      {
        name: String,
        issuer: String,
        year: String,
      },
    ],
    languages: [String],
    fees: {
      type: Number,
      required: true,
      default: 0,
    },
    about: {
      type: String,
      maxLength: 500,
    },
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String,
    },
    timeSlots: [timeSlotSchema],
    isAvailable: {
      type: Boolean,
      default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Doctor', doctorSchema);