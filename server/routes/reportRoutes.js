const express = require('express');
const router = express.Router();
const ReportController = require('../controllers/ReportController');
const authenticateToken = require('../middleware/auth');

// Route for fetching monthly reports
router.get('/', authenticateToken, ReportController.getMonthlyReports);

module.exports = router;
