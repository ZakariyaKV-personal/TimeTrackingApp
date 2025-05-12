// models/task.model.js
const db = require('../config/db'); // Import database connection

const Task = {
    create: (taskData, callback) => {        
        // Convert userId array to a comma-separated string
        const userIds = Array.isArray(taskData.userId) ? taskData.userId.join(',') : taskData.userId;
        
        const query = `INSERT INTO tasks (name, user_id, project_id, description, status, status_id, updated_user, priority, deadline_date, time, notes, assigning, domain) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        const { name, projectId, description, status, updated_user = '', priority, deadlineDate, time, notes = '', assigning, domain } = taskData;
        const status_id = status === 'completed' ? 1 : 0;
    
        db.query(query, [name, userIds, projectId, description, status, status_id, updated_user || '', priority || 'Low', deadlineDate, time, notes || '', assigning, domain], callback);
    },

    findById: (id, callback) => {
        const query = `SELECT * FROM tasks WHERE id = ?`;
        db.query(query, [id], callback);
    },
    findByProjectId: (projectId, callback) => {
        const query = `SELECT * FROM tasks WHERE project_id =?`;
        db.query(query, [projectId], callback);
    },
    findAll: (domain, callback) => {
        const query = `SELECT * FROM tasks WHERE domain =?`;
        db.query(query, [domain], callback);
    },

    update: (id, taskData, callback) => {
        const userIds = Array.isArray(taskData.userId) ? taskData.userId.join(',') : taskData.userId;
        const query = `UPDATE tasks SET name = ?, user_id = ?, project_id = ?, description = ?, status = ?, status_id = ?, updated_user = ?, priority = ?, deadline_date = ?, time = ?, notes = ?, assigning = ?, domain = ? WHERE id = ?`;
        const { name, projectId, description, status, updated_user, priority, deadlineDate, time, notes, assigning, domain } = taskData;
        const status_id = status === 'completed' ? 1 : 0;
        db.query(query, [name, userIds, projectId, description, status, status_id, updated_user, priority, deadlineDate, time, notes || '', assigning, domain, id], callback);
    },

    delete: (id, callback) => {
        const query = `DELETE FROM tasks WHERE id = ?`;
        db.query(query, [id], callback);
    },

    findByUserId: (userId, projectId, callback) => {    
        const query = `SELECT * FROM tasks WHERE FIND_IN_SET(?, user_id) AND project_id = ?`;
        db.query(query, [userId, projectId], callback);
    },
};

module.exports = Task;
