const db = require('../config/db');

const CommonLeave = {
    // Create a new common leave
    create: (leaveData, callback) => {
        const query = `INSERT INTO "_common_leaves" (leave_name, leave_date, domain) VALUES ($1, $2, $3) RETURNING *`;
        const { leave_name, leave_date, domain } = leaveData;
        const utcLeaveDate = new Date(leave_date).toISOString().split('T')[0]; // Format as 'YYYY-MM-DD'
        db.query(query, [leave_name, utcLeaveDate, domain], (err, result) => {
            if (err) return callback(err);
            callback(null, result.rows[0]);
        });
    },

    // Find a leave by its ID
    findById: (id, callback) => {
        const query = `SELECT * FROM "_common_leaves" WHERE id = $1`;
        db.query(query, [id], (err, result) => {
            if (err) return callback(err);
            callback(null, result.rows[0]);
        });
    },

    // Get all common leaves by domain
    findAll: (domain) => {
        return new Promise((resolve, reject) => {
            const query = `SELECT * FROM "_common_leaves" WHERE domain = $1`;
            db.query(query, [domain], (err, result) => {
                if (err) return reject(err);
                resolve(result.rows);
            });
        });
    },

    // Update an existing common leave by ID
    update: (id, leaveData, callback) => {
        const query = `UPDATE "_common_leaves" SET leave_name = $1, leave_date = $2, domain = $3 WHERE id = $4 RETURNING *`;
        const { leave_name, leave_date, domain } = leaveData;
        const utcLeaveDate = new Date(leave_date).toISOString().split('T')[0];
        db.query(query, [leave_name, utcLeaveDate, domain, id], (err, result) => {
            if (err) return callback(err);
            callback(null, result.rows[0]);
        });
    },

    // Delete a common leave by ID
    delete: (id, callback) => {
        const query = `DELETE FROM "_common_leaves" WHERE id = $1`;
        db.query(query, [id], callback);
    }
};

module.exports = CommonLeave;
