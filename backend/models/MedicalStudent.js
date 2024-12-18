const mongoose = require('mongoose');


const MedicalStudentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    progress: [{
        caseId: { type: String },
        quizScore: { type: Number }
    }],
    resources: [{ type: String }] // Links to educational materials
}, { timestamps: true });

module.exports = mongoose.model('MedicalStudent', MedicalStudentSchema);