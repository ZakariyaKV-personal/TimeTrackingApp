const express = require('express');
const router = express.Router();
const {
  createLeave,
  getAllLeaves,
  getLeaveById,
  updateLeave,
  deleteLeave
} = require('../controllers/commonLeavesController');

// Define routes
router.post('/', createLeave); // Create
router.get('/:domain', getAllLeaves); // Read all
router.get('/:id', getLeaveById); // Read one by ID
router.put('/:id', updateLeave); // Update
router.delete('/:id', deleteLeave); // Delete

module.exports = router;
