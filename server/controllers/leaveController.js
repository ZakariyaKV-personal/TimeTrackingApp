// controllers/leaveController.js
const db = require('../config/db');

// Create a leave request
exports.createLeave = (req, res) => {
  const { userId, username, leaveType, leaveComment, leaveDate } = req.body;

  const query = `INSERT INTO leaves (user_id, user_name, leave_type, comment, leave_date) VALUES (?, ?, ?, ?, ?)`;

  db.query(query, [userId, username, leaveType, leaveComment, leaveDate ], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to apply leave' });
    }
    res.status(201).json({ message: 'Leave applied successfully', leaveId: result.insertId });
  });
};

// Get leave requests for a user
exports.getLeaves = (req, res) => {
  const userId = req.params.id;
  const query = 'SELECT * FROM leaves WHERE user_id = ?';

  db.query(query, [userId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch leaves' });
    }
    res.status(200).json({ leaves: results });
  });
};

exports.getAllLeaves = (req, res) => {
    const userEmail = req.params.email; // Extract email from URL parameter
    
    if (!userEmail) {
      return res.status(400).json({ error: 'Email is required' });
    }
  
    const domain = userEmail.split('@')[1]; // Extract domain from the email
  
    if (!domain) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
  
    // SQL query to get leaves for users with the same domain
    const query = `
      SELECT * FROM leaves
      WHERE user_id IN (SELECT id FROM users WHERE email LIKE ?)
    `;
  
    // Use parameterized queries to avoid SQL injection
    db.query(query, [`%@${domain}`], (err, results) => {
      if (err) {
        console.error('Database error:', err); // Log database error for debugging
        return res.status(500).json({ error: 'Failed to fetch leave applications' });
      }
      res.status(200).json({ leaves: results });
    });
  };
  
// Delete a leave request by ID
exports.deleteLeave = (req, res) => {
    const leaveId = req.params.id;
    
    const query = 'DELETE FROM leaves WHERE id = ?';
  
    db.query(query, [leaveId], (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to delete leave application' });
      }
      
      // Check if any rows were affected (meaning the leave was deleted)
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Leave application not found' });
      }
  
      res.status(200).json({ message: 'Leave application deleted successfully' });
    });
  };

  exports.updateLeaveStatus = (req, res) => {
    const { leaveId } = req.params;
    const { status } = req.body; // Expecting { status: 'approved' | 'declined' }
  
    // Validate the status
    if (!['approved', 'declined'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Only "approved" or "declined" are allowed.' });
    }
  
    const query = 'UPDATE leaves SET status = ? WHERE id = ?';
  
    db.query(query, [status, leaveId], (err, result) => {
      if (err) {
        console.error('Error updating status:', err);
        return res.status(500).json({ error: 'Failed to update leave status' });
      }
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Leave application not found' });
      }
  
      res.status(200).json({ message: `Leave status updated to ${status}` });
    });
  };

  exports.getPendingLeavesCount = (req, res) => {
    const userEmail = req.params.email; // Extract the email from the request parameters
    
    const domain = userEmail.split('@')[1]; // Extract the domain part of the email
  
    // SQL query to get the count of pending leaves for users with the same email domain
    const query = `
      SELECT COUNT(*) AS pendingLeavesCount 
      FROM leaves 
      WHERE status = 'pending' 
        AND user_id IN (SELECT id FROM users WHERE email LIKE ?)
    `;
  
    db.query(query, [`%@${domain}`], (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch pending leaves count' });
      }
      res.status(200).json({ count: results[0].pendingLeavesCount });
    });
  };