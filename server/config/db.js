require('dotenv').config();
const mysql = require('mysql2'); // Ensure you're using mysql2 if it's installed

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // Default username for XAMPP
    password: '', // Default password (usually empty for root in XAMPP)
    database: 'time_tracking', // Replace with your database name
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err);
        return;
    }
    console.log('Connected to database.');
});

module.exports = db;
