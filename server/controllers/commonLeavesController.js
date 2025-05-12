const CommonLeave = require('../models/CommonLeave');

// Create a new common leave
const createLeave = (req, res) => {
    const leaveData = req.body;
    CommonLeave.create(leaveData, (error, result) => {
        if (error) {
            return res.status(500).json({ error: error.message });
        }
        res.status(201).json({ message: 'Leave created successfully', leaveId: result.insertId });
    });
};

// Get all common leaves
const getAllLeaves = async (req, res) => {
    const domain = req.params.domain;
    try {
        const allLeaves = await CommonLeave.findAll(domain); // Pass the domain to findAll

        res.status(200).json(allLeaves);
    } catch (err) {
        console.error("Error fetching leaves:", err);
        res.status(500).send("Error fetching leaves");
    }
};


// Get a specific common leave
const getLeaveById = (req, res) => {
    const { id } = req.params;
    CommonLeave.findById(id, (error, result) => {
        if (error) {
            return res.status(500).json({ error: error.message });
        }
        if (!result) {
            return res.status(404).json({ message: 'Leave not found' });
        }
        res.status(200).json(result);
    });
};

// Update a specific common leave
const updateLeave = (req, res) => {
    const { id } = req.params;
    const leaveData = req.body;
    CommonLeave.update(id, leaveData, (error, result) => {
        if (error) {
            return res.status(500).json({ error: error.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Leave not found' });
        }
        res.status(200).json({ message: 'Leave updated successfully' });
    });
};

// Delete a specific common leave
const deleteLeave = (req, res) => {
    const { id } = req.params;
    CommonLeave.delete(id, (error, result) => {
        if (error) {
            return res.status(500).json({ error: error.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Leave not found' });
        }
        res.status(200).json({ message: 'Leave deleted successfully' });
    });
};

module.exports = {
    createLeave,
    getAllLeaves,
    getLeaveById,
    updateLeave,
    deleteLeave
};
