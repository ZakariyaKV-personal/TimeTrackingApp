// models/CommonLeave.js
const db = require('../config/db');

const CommonLeave = {
    // Create a new common leave
    create: (leaveData, callback) => {
        const query = `INSERT INTO common_leaves (leave_name, leave_date, domain) VALUES (?, ?, ?)`;
        const { leave_name, leave_date, domain } = leaveData;
        // Storing date in UTC format
        const utcLeaveDate = new Date(leave_date).toISOString().split('T')[0]; // Format as 'YYYY-MM-DD'
        db.query(query, [leave_name, utcLeaveDate, domain], callback);
    },

    // Find a leave by its ID
    findById: (id, callback) => {
        const query = `SELECT * FROM common_leaves WHERE id = ?`;
        db.query(query, [id], callback);
    },

    // Get all common leaves
    findAll: (domain) => {
        return new Promise((resolve, reject) => {
            // Update the query to exclude users with the superadmin role
            db.query('SELECT * FROM common_leaves WHERE domain = ?', [domain], (err, results) => {
                if (err) reject(err);
                resolve(results);
            });
        });
    },

    // Update an existing common leave by ID
    update: (id, leaveData, callback) => {
        const query = `UPDATE common_leaves SET leave_name = ?, leave_date = ?, domain = ? WHERE id = ?`;
        const { leave_name, leave_date, domain } = leaveData;
        const utcLeaveDate = new Date(leave_date).toISOString().split('T')[0];
        db.query(query, [leave_name, utcLeaveDate, domain, id], callback);
    },

    // Delete a common leave by ID
    delete: (id, callback) => {
        const query = `DELETE FROM common_leaves WHERE id = ?`;
        db.query(query, [id], callback);
    }
};

module.exports = CommonLeave;
