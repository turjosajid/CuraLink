const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  quizScores: [{
    quizId: mongoose.Schema.Types.ObjectId,
    score: Number,
    date: Date
  }],
  accessedCases: [{
    caseId: mongoose.Schema.Types.ObjectId,
    date: Date
  }]
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);
