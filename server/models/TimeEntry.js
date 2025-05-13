const db = require('../config/db');

const TimeEntry = {
    // Create a new time entry
    create: (userId, title, projectId, projectName, taskId, taskName, status, startTime, endTime, date, callback) => {
        db.query(
            'INSERT INTO "_time_entries" (user_id, title, project_id, project_name, task_id, task_name, status, start_time, end_time, date) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *', 
            [userId, title, projectId, projectName, taskId, taskName, status, startTime, endTime, date],
            (err, result) => {
                if (err) return callback(err);
                callback(null, result.rows[0]); // Return inserted row
            }
        );
    },

    // Update time entry
    update: (id, updatedData) => {
        return new Promise((resolve, reject) => {
            const { title, projectId, projectName, taskId, taskName, date, startTime, endTime, status } = updatedData;
            const query = `UPDATE "_time_entries" 
                           SET title = $1, project_id = $2, project_name = $3, task_id = $4, task_name = $5, date = $6, start_time = $7, end_time = $8, status = $9 
                           WHERE id = $10 RETURNING *`;
            const values = [title, projectId, projectName, taskId, taskName, date, startTime, endTime, status, id];
            db.query(query, values, (err, result) => {
                if (err) return reject(err);
                resolve(result.rows[0] || null);
            });
        });
    },

    // Delete time entry
    delete: (id, callback) => {
        db.query('DELETE FROM "_time_entries" WHERE id = $1', [id], callback);
    },

    // Find all entries
    findAll: (callback) => {
        db.query('SELECT * FROM "_time_entries"', (err, result) => {
            if (err) return callback(err);
            callback(null, result.rows);
        });
    },

    // Find by ID
    findById: (id) => {
        return new Promise((resolve, reject) => {
            db.query('SELECT * FROM "_time_entries" WHERE id = $1', [id], (err, result) => {
                if (err) return reject(err);
                resolve(result.rows[0] || null);
            });
        });
    },

    // Find by User ID
    findByUserId: (userId) => {
        return new Promise((resolve, reject) => {
            db.query('SELECT * FROM "_time_entries" WHERE user_id = $1', [userId], (err, result) => {
                if (err) return reject(err);
                resolve(result.rows);
            });
        });
    },

    findByProjectId: (projectId, callback) => {
        db.query('SELECT * FROM "_time_entries" WHERE project_id = $1', [projectId], (err, result) => {
            if (err) return callback(err);
            callback(null, result.rows);
        });
    },

    // Monthly summary
    getMonthlyEntries: (month, year, userId, callback) => {
        const query = `
            SELECT 
                u.id AS user_id,
                u.name AS userName,
                t.title,
                t.project_name,
                t.task_name,
                t.start_time,
                t.end_time,
                t.date,
                CONCAT(
                    FLOOR(SUM(EXTRACT(EPOCH FROM (t.end_time - t.start_time))) / 3600), ' hours ',
                    FLOOR((SUM(EXTRACT(EPOCH FROM (t.end_time - t.start_time))) % 3600) / 60), ' minutes'
                ) AS totalTime
            FROM "_time_entries" t
            JOIN "_users" u ON t.user_id = u.id
            WHERE EXTRACT(MONTH FROM t.date) = $1 
              AND EXTRACT(YEAR FROM t.date) = $2
              AND t.user_id = $3
              AND t.start_time IS NOT NULL
              AND t.end_time IS NOT NULL
            GROUP BY u.id, u.name, t.title, t.project_name, t.task_name, t.date, t.start_time, t.end_time;
        `;
        db.query(query, [month, year, userId], (err, result) => {
            if (err) return callback(err);
            console.log(result.rows);
            
            callback(null, result.rows);
        });
    }
};

module.exports = TimeEntry;
