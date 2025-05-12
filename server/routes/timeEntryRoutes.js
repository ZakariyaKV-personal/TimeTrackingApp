// backend/routes/timeEntryRoutes.js
const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const TimeEntryController = require('../controllers/TimeEntryController');

// Routes for handling time entries
router.post('/', authenticateToken, TimeEntryController.createTimeEntry);
router.put('/:id', authenticateToken, TimeEntryController.updateTimeEntry);
router.delete('/:id', authenticateToken, TimeEntryController.deleteTimeEntry);

// Fetch time entries (optionally filtered by date)
router.get('/:domain', authenticateToken, TimeEntryController.getTimeEntries);  // No date parameter in the URL
router.get('/:date', authenticateToken, TimeEntryController.getTimeEntriesByDate);  // Optional date parameter

module.exports = router;
