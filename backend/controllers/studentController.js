const Student = require('../models/studentModel');
const User = require('../models/userModel');

exports.getStudentProfile = async (req, res) => {
  try {
    let student = await Student.findOne({ userId: req.user._id })
      .populate('userId', '-password')
      .populate('accessedCases.caseId', 'title summary');
    
    if (!student) {
      // Create a new student profile if not found
      student = await Student.create({ userId: req.user._id });
      await User.findByIdAndUpdate(req.user._id, { role: 'student' });
    }

    res.status(200).json(student);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching student profile', error: error.message });
  }
};

exports.accessCaseStudy = async (req, res) => {
  try {
    const { caseId } = req.params;
    // const caseStudy = await CaseStudy.findById(caseId).select('title summary content');

    // if (!caseStudy) {
    //   return res.status(404).json({ message: 'Case study not found' });
    // }

    const student = await Student.findOne({ userId: req.user._id });
    student.accessedCases.push({ caseId, date: new Date() });
    await student.save();

    res.status(200).json({ message: 'Case study accessed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error accessing case study', error: error.message });
  }
};

exports.trackQuizScore = async (req, res) => {
  try {
    const { quizId, score } = req.body;
    const student = await Student.findOne({ userId: req.user._id });

    student.quizScores.push({ quizId, score, date: new Date() });
    await student.save();

    res.status(200).json({ message: 'Quiz score tracked successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error tracking quiz score', error: error.message });
  }
};
