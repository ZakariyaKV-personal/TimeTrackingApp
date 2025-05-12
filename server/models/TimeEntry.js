// server/models/TimeEntry.js
const db = require('../config/db');

const TimeEntry = {
    // Create a new time entry with start and end time
    create: (userId, title, projectId, projectName, taskId, taskName, status, startTime, endTime, date, callback) => {
        // Insert the new time entry
        db.query(
            'INSERT INTO time_entries (user_id, title, project_id, project_name, task_id, task_name, status, start_time, end_time, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', 
            [userId, title, projectId, projectName, taskId, taskName, status, startTime, endTime, date],
            (err, result) => {
                if (err) return callback(err); // Handle insert query errors
    
                // Get the ID of the new time entry
                const newTimeEntry = { 
                    id: result.insertId, 
                    userId, 
                    title, 
                    projectId, 
                    projectName, 
                    taskId, 
                    taskName, 
                    status, 
                    startTime, 
                    endTime, 
                    date 
                };
    
                // Return the new time entry
                callback(null, newTimeEntry);
            }
        );
    },
    
    
    
    // Update an existing time entry's start and end time
    update: (id, updatedData) => {
        return new Promise((resolve, reject) => {
            const {title, projectId, projectName, taskId, taskName, date, startTime, endTime, status } = updatedData;
            
            const query = `UPDATE time_entries 
                           SET title = ?, project_id = ?, project_name = ?, task_id = ?, task_name = ?, date = ?, start_time = ?, end_time = ?, status = ? 
                           WHERE id = ?`;
            const values = [title, projectId, projectName, taskId, taskName, date, startTime, endTime, status, id];
    
            db.query(query, values, (err, result) => {
                if (err) reject(err);
                resolve(result);
            });
        });
    },

    // Delete a time entry
    delete: (id, callback) => {
        db.query(
            'DELETE FROM time_entries WHERE id = ?', 
            [id], 
            callback
        );
    },

    // Find all time entries
    findAll: (callback) => {
        db.query(
            'SELECT * FROM time_entries', 
            callback
        );
    },

    // Find a time entry by ID
    findById: (id) => {
        return new Promise((resolve, reject) => {
            db.query(
                'SELECT * FROM time_entries WHERE id = ?', 
                [id], 
                (error, results) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(results[0] || null); // Return the first result, or null if none
                    }
                }
            );
        });
    },
    

    // Find time entries by user ID
    findByUserId: (userId) => {
        return new Promise((resolve, reject) => {
            db.query(
                `SELECT * FROM time_entries
                WHERE user_id = ?`, 
                [userId], 
                (err, results) => {
                    if (err) return reject(err);
                    resolve(results);
                }
            );
        });
    },
    

    // Find time entries by project ID
    findByProjectId: (projectId, callback) => {
        db.query(
            'SELECT * FROM time_entries WHERE project_id = ?', 
            [projectId], 
            callback
        );
    },

    // Get all time entries for a specific month and year
    getMonthlyEntries: (month, year, user, callback) => {
        const query = `
            SELECT 
            u.id AS user_id,
            u.name AS userName,    -- Fetch userName
            t.title,               -- Title
            t.project_name,        -- Project name
            t.task_name,           -- Task name
            t.start_time,          -- Start time
            t.end_time,            -- End time
            t.date,                -- Date
            CONCAT(
                FLOOR(SUM(TIMESTAMPDIFF(SECOND, t.start_time, t.end_time)) / 3600), ' hours ', 
                FLOOR((SUM(TIMESTAMPDIFF(SECOND, t.start_time, t.end_time)) % 3600) / 60), ' minutes'
            ) AS totalTime
        FROM time_entries t
        JOIN users u ON t.user_id = u.id
        WHERE MONTH(t.date) = ? 
        AND YEAR(t.date) = ? 
        AND t.user_id = ?  -- Fetch data for a specific user
        AND t.start_time IS NOT NULL
        AND t.end_time IS NOT NULL
        GROUP BY t.user_id, t.project_name, t.task_name, t.date, t.title, t.start_time, t.end_time;

        `;
        db.query(query, [month, year, user], callback);
    }    
    
}    

module.exports = TimeEntry;
