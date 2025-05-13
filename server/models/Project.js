const db = require('../config/db');

const Project = {
    create: (users_id, name, description, domain, callback) => {
        const usersIdString = JSON.stringify(users_id);
        const query = 'INSERT INTO "_projects" (users_id, name, description, domain) VALUES ($1, $2, $3, $4) RETURNING *';
        db.query(query, [usersIdString, name, description, domain], (err, result) => {
            if (err) return callback(err);
            callback(null, result.rows[0]);
        });
    },

    update: (id, users_id, name, description, domain, callback) => {
        const usersIdString = JSON.stringify(users_id);
        const query = `
            UPDATE "_projects"
            SET users_id = $1, name = $2, description = $3, domain = $4
            WHERE id = $5 RETURNING *`;
        db.query(query, [usersIdString, name, description, domain, id], (err, result) => {
            if (err) return callback(err);
            callback(null, result.rows[0]);
        });
    },

    delete: (id, callback) => {
        const query = 'DELETE FROM "_projects" WHERE id = $1';
        db.query(query, [id], callback);
    },

    findAll: (domain, callback) => {
        console.log(domain);
        const query = 'SELECT * FROM "_projects" WHERE domain = $1';
        db.query(query, [domain], (err, result) => {
            if (err) return callback(err);
            callback(null, result.rows);
        });
    },

    findById: (userId, callback) => {
        const query = `
            SELECT * FROM "_projects"
            WHERE users_id::jsonb @> $1::jsonb`;
        db.query(query, [JSON.stringify([userId])], (err, result) => {
            if (err) return callback(err);
            callback(null, result.rows);
        });
    },
};

module.exports = Project;
