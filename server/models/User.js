const db = require('../config/db');
const bcrypt = require('bcryptjs');

const User = {
    create: (name, email, password, role = 'user', status = 0, domain, callback) => {
        db.query(
            'INSERT INTO "_users" (name, email, password, role, status, domain) VALUES ($1, $2, $3, $4, $5, $6)',
            [name, email, password, role, status, domain],
            callback
        );
    },    

    findByEmail: (email) => {
        return new Promise((resolve, reject) => {
            db.query('SELECT * FROM _users WHERE email = $1', [email], (err, results) => {
                if (err) {
                    console.error('Database error:', err);
                    reject(err);
                }
                if (results.rows.length === 0) {
                    return resolve(null); // Handle no user found case
                }
                resolve(results.rows[0]); // PostgreSQL uses 'rows' for result data
            });
        });
    },
    

    findById: (id) => {
        return new Promise((resolve, reject) => {
            db.query('SELECT * FROM "_users" WHERE id = $1', [id], (err, results) => {
                if (err) reject(err);
                resolve(results.rows[0]); // Using `rows[0]` as PostgreSQL returns the results in `rows`
            });
        });
    },
    
    getAllUsers: () => {
        return new Promise((resolve, reject) => {
            // Update the query to exclude users with the superadmin role
            db.query('SELECT * FROM "_users"', (err, results) => {
                if (err) reject(err);
                resolve(results.rows); // Return all rows
            });
        });
    },
    
    // Update user status (verified or declined)
    updateUserStatus: (id, status) => {
        return new Promise((resolve, reject) => {
            const query = 'UPDATE "_users" SET status = $1 WHERE id = $2';
            db.query(query, [status, id], (err, results) => {
                if (err) reject(err);
                resolve(results.rowCount > 0 ? { id, status } : null); // Use `rowCount` in PostgreSQL
            });
        });
    },
    
    // Add a function to update the user's password
    updatePassword: (id, newPassword) => {
        return new Promise(async (resolve, reject) => {
            try {
                // Hash the new password
                const hashedPassword = await bcrypt.hash(newPassword, 10);
    
                // Update the user's password in the database
                const query = 'UPDATE "_users" SET password = $1 WHERE id = $2';
                db.query(query, [hashedPassword, id], (err, results) => {
                    if (err) return reject(err);
    
                    // Check if the query updated any rows and return the appropriate result
                    if (results && results.rowCount > 0) {
                        resolve({ id, password: hashedPassword });
                    } else {
                        resolve(null); // No user found or no change in the password
                    }
                });
            } catch (error) {
                reject(error); // Pass any other error to the reject handler
            }
        });
    },    

    // Additional functions like update, delete can be added here.
};

module.exports = User;
