// backend/controllers/TimeEntryController.js
const TimeEntry = require('../models/TimeEntry');
const CommonLeave = require('../models/CommonLeave');

// Create a new time entry
exports.createTimeEntry = (req, res) => {
    const {title, projectId, projectName, taskId, taskName, status, startTime, endTime, date } = req.body;
    const userId = req.user.id;
    TimeEntry.create(userId, title, projectId, projectName, taskId, taskName, status, startTime, endTime, date, (err, newTimeEntry) => {
        if (err) {
            console.error("Error creating time entry:", err);
            return res.status(400).json({ message: 'Failed to create time entry', error: err.message });
        }

        // If successful, return the new time entry
        res.status(201).json({ message: 'Time added successfully', newTimeEntry });
    });
};
// Get all time entries (or filter by date)
exports.getTimeEntries = async (req, res) => {
    const userId = req.user.id;  // Ensure the user ID is available from JWT
    const domain = req.params.domain;  // Optional date parameter in the URL
    try {
        const entries = await TimeEntry.findByUserId(userId);
        const leaves = await CommonLeave.findAll(domain);
        
        res.status(200).json({ timeEntries: entries, leaves });  // Return the time entries as JSON
    } catch (err) {
        console.error("Error fetching time entries:", err);
        res.status(500).json({ message: 'Failed to fetch time entries', error: err.message });
    }
};

exports.updateTimeEntry = async (req, res) => {
    const {title, projectId, projectName, taskId, taskName, status, startTime, endTime, date } = req.body;
    const id = req.params.id;

    try {
        // Validate if the time entry exists
        const timeEntry = await TimeEntry.findById(id);
        const leaves = await CommonLeave.findAll();
        if (!timeEntry) {
            return res.status(404).send("Time entry not found");
        }

        // Update the time entry in the database
        const updatedEntry = await TimeEntry.update(id, {
            title,
            projectId,
            projectName,
            taskId,
            taskName,
            status,
            startTime,
            endTime,
            date
        });

        res.status(200).json({timeEntries: updatedEntry, leaves });
    } catch (err) {
        console.error("Error updating time entry:", err);
        res.status(500).send("Error updating time entry");
    }
};



// Get time entries by date
exports.getTimeEntriesByDate = async (req, res) => {
    const { date } = req.params;

    try {
        const entries = await TimeEntry.find({ userId: req.user.id, date });
        res.status(200).json(entries);
    } catch (err) {
        res.status(400).json({ message: 'Failed to fetch time entries by date', error: err.message });
    }
};

// Delete time entry
exports.deleteTimeEntry = (req, res) => {
    const { id } = req.params;

    // Use a MySQL query to delete the time entry by ID
    TimeEntry.delete(id, (err, result) => {
        if (err) {
            console.error("Error deleting time entry:", err);
            return res.status(400).json({ message: 'Failed to delete time entry', error: err.message });
        }

        // If successful, return a success message
        res.status(200).json({ message: 'Time entry deleted successfully' });
    });
};
