// routes/leaveRoutes.js
const express = require('express');
const leaveController = require('../controllers/leaveController');

const router = express.Router();

router.post('/apply', leaveController.createLeave);
router.get('/:id', leaveController.getLeaves);
router.get('/all/:email', leaveController.getAllLeaves);
router.delete('/:id', leaveController.deleteLeave);
router.put('/leave-status/:leaveId', leaveController.updateLeaveStatus);
router.get('/pending-leaves-count/:email', leaveController.getPendingLeavesCount);

module.exports = router;
