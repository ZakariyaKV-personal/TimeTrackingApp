const db = require('../config/db');
const bcrypt = require('bcryptjs');

const User = {
    create: (name, email, password, role = 'user', status = 0, domain, callback) => {
        db.query(
            'INSERT INTO users (name, email, password, role, status, domain) VALUES (?, ?, ?, ?, ?, ?)',
            [name, email, password, role, status, domain],
            callback
        );
    },

    findByEmail: (email) => {
        return new Promise((resolve, reject) => {
            db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
                if (err) reject(err);
                if (!results || results.length === 0) {
                    return resolve(null);  // Return null if no user found
                }
                resolve(results[0]);
            });
        });
    },

    findById: (id, callback) => {
        return new Promise((resolve, reject) => {
            db.query('SELECT * FROM users WHERE id = ?', [id], (err, results) => {
                if (err) reject(err);
                resolve(results);
            });
        });
    },
    getAllUsers: () => {
        return new Promise((resolve, reject) => {
            // Update the query to exclude users with the superadmin role
            db.query('SELECT * FROM users', (err, results) => {
                if (err) reject(err);
                resolve(results);
            });
        });
    },

    // Update user status (verified or declined)
    updateUserStatus: (id, status) => {
        return new Promise((resolve, reject) => {
            const query = 'UPDATE users SET status = ? WHERE id = ?';
            db.query(query, [status, id], (err, results) => {
                if (err) reject(err);
                resolve(results.affectedRows > 0 ? { id, status } : null); // Return updated user or null if not found
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
                const query = 'UPDATE users SET password = ? WHERE id = ?';
                db.query(query, [hashedPassword, id], (err, results) => {
                    if (err) return reject(err);

                    // Check if the query updated any rows and return the appropriate result
                    if (results && results.affectedRows > 0) {
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
