const express = require('express');
const { getStudentProfile, accessCaseStudy, trackQuizScore } = require('../controllers/studentController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All student routes require authentication
router.use(protect);

router.get('/profile', getStudentProfile);
router.get('/case-studies/:caseId', accessCaseStudy);
router.post('/quiz-scores', trackQuizScore);

module.exports = router;
