const db = require('../config/db');

const Project = {
    create: (users_id, name, description, domain, callback) => {        
        const usersIdString = JSON.stringify(users_id);        
        db.query('INSERT INTO projects (users_id, name, description, domain) VALUES (?, ?, ?, ?)', 
                 [usersIdString, name, description, domain], callback);
    },
    update: (id, users_id, name, description, domain, callback) => {           
        const usersIdString = JSON.stringify(users_id);          
        db.query('UPDATE projects SET users_id = ?, name = ?, description = ?, domain = ? WHERE id = ?', 
                 [usersIdString, name, description, domain, id], callback);
    },
    delete: (id, callback) => {
        db.query('DELETE FROM projects WHERE id = ?', [id], callback);
    },
    findAll: (domain, callback) => {
        db.query('SELECT * FROM projects WHERE domain = ?',[domain], callback);
    },

    findById: (userId, callback) => {
        // Ensure userId is a number before using it in the query
        const query = "SELECT * FROM projects WHERE JSON_CONTAINS(users_id, ?)"
        const userIdString = `"${userId}"`;
        // Execute query
        db.query(query, [userIdString], callback);
    },    
};

module.exports = Project;
