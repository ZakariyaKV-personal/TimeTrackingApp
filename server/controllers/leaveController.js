// controllers/leaveController.js
const db = require('../config/db');

// Create a leave request
exports.createLeave = (req, res) => {
  const { userId, username, leaveType, leaveComment, leaveDate } = req.body;

  const query = `INSERT INTO _leaves (user_id, user_name, leave_type, comment, leave_date, status) 
                 VALUES ($1, $2, $3, $4, $5, 'pending') RETURNING id`;

  db.query(query, [userId, username, leaveType, leaveComment, leaveDate], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to apply leave' });
    }
    res.status(201).json({ message: 'Leave applied successfully', leaveId: result.rows[0].id });
  });
};

// Get leave requests for a user
exports.getLeaves = (req, res) => {
  const userId = req.params.id;
  const query = 'SELECT * FROM _leaves WHERE user_id = $1';

  db.query(query, [userId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch leaves' });
    }
    res.status(200).json({ leaves: results.rows });
  });
};

exports.getAllLeaves = (req, res) => {
  const userEmail = req.params.email;

  if (!userEmail) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const domain = userEmail.split('@')[1];

  if (!domain) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  const query = `
    SELECT * FROM _leaves 
    WHERE user_id IN (SELECT id FROM _users WHERE email LIKE $1)
  `;

  db.query(query, [`%@${domain}`], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch leave applications' });
    }
    res.status(200).json({ leaves: results.rows });
  });
};

// Delete a leave request by ID
exports.deleteLeave = (req, res) => {
  const leaveId = req.params.id;
  const query = 'DELETE FROM _leaves WHERE id = $1';

  db.query(query, [leaveId], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to delete leave application' });
    }

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Leave application not found' });
    }

    res.status(200).json({ message: 'Leave application deleted successfully' });
  });
};

exports.updateLeaveStatus = (req, res) => {
  const { leaveId } = req.params;
  const { status } = req.body;

  if (!['approved', 'declined'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status. Only "approved" or "declined" are allowed.' });
  }

  const query = 'UPDATE _leaves SET status = $1 WHERE id = $2';

  db.query(query, [status, leaveId], (err, result) => {
    if (err) {
      console.error('Error updating status:', err);
      return res.status(500).json({ error: 'Failed to update leave status' });
    }

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Leave application not found' });
    }

    res.status(200).json({ message: `Leave status updated to ${status}` });
  });
};

exports.getPendingLeavesCount = (req, res) => {
  const userEmail = req.params.email;

  const domain = userEmail.split('@')[1];

  const query = `
    SELECT COUNT(*) AS pendingLeavesCount 
    FROM _leaves 
    WHERE status = 'pending' 
      AND user_id IN (SELECT id FROM _users WHERE email LIKE $1)
  `;

  db.query(query, [`%@${domain}`], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch pending leaves count' });
    }
    res.status(200).json({ count: results.rows[0].pendingleavescount });
  });
};
