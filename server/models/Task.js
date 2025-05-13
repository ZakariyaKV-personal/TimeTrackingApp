const db = require('../config/db'); // Import database connection

const Task = {
    create: (taskData, callback) => {        
        const userIds = Array.isArray(taskData.userId) ? taskData.userId.join(',') : taskData.userId;
        const query = `
            INSERT INTO "_tasks" (name, user_id, project_id, description, status, status_id, updated_user, priority, deadline_date, time, notes, assigning, domain)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            RETURNING *`;
        
        const { name, projectId, description, status, updated_user = '', priority, deadlineDate, time, notes = '', assigning, domain } = taskData;
        const status_id = status === 'completed' ? 1 : 0;

        const values = [name, userIds, projectId, description, status, status_id, updated_user, priority || 'Low', deadlineDate, time, notes, assigning, domain];
        db.query(query, values, (err, result) => {
            if (err) return callback(err);
            callback(null, result.rows[0]);
        });
    },

    findById: (id, callback) => {
        const query = `SELECT * FROM "_tasks" WHERE id = $1`;
        db.query(query, [id], (err, result) => {
            if (err) return callback(err);
            callback(null, result.rows[0]);
        });
    },

    findByProjectId: (projectId, callback) => {
        const query = `SELECT * FROM "_tasks" WHERE project_id = $1`;
        db.query(query, [projectId], (err, result) => {
            if (err) return callback(err);
            callback(null, result.rows);
        });
    },

    findAll: (domain, callback) => {
        const query = `SELECT * FROM "_tasks" WHERE domain = $1`;
        db.query(query, [domain], (err, result) => {
            if (err) return callback(err);
            callback(null, result.rows);
        });
    },

    update: (id, taskData, callback) => {
        const userIds = Array.isArray(taskData.userId) ? taskData.userId.join(',') : taskData.userId;
        const query = `
            UPDATE "_tasks"
            SET name = $1, user_id = $2, project_id = $3, description = $4, status = $5, status_id = $6,
                updated_user = $7, priority = $8, deadline_date = $9, time = $10, notes = $11,
                assigning = $12, domain = $13
            WHERE id = $14 RETURNING *`;

        const { name, projectId, description, status, updated_user, priority, deadlineDate, time, notes, assigning, domain } = taskData;
        const status_id = status === 'completed' ? 1 : 0;

        const values = [name, userIds, projectId, description, status, status_id, updated_user, priority, deadlineDate, time, notes || '', assigning, domain, id];
        db.query(query, values, (err, result) => {
            if (err) return callback(err);
            callback(null, result.rows[0]);
        });
    },

    delete: (id, callback) => {
        const query = `DELETE FROM "_tasks" WHERE id = $1`;
        db.query(query, [id], callback);
    },

    findByUserId: (userId, projectId, callback) => {
        const query = `
            SELECT * FROM "_tasks"
            WHERE user_id IS NOT NULL
              AND string_to_array(user_id, ',') @> ARRAY[$1]
              AND project_id = $2`;
        db.query(query, [userId.toString(), projectId], (err, result) => {
            if (err) return callback(err);
            callback(null, result.rows);
        });
    },
};

module.exports = Task;
