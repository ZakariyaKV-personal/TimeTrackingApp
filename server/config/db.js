require('dotenv').config();
const { Client } = require('pg'); // Import the pg client for PostgreSQL

// Create a PostgreSQL client
const client = new Client({
    connectionString: 'postgresql://renderusersql:mGVtipR9jeZ5xe4FoW3yDhxpL5YRkcvj@dpg-d0gpvhidbo4c73bkhuo0-a:5432/timetracking_sql', // PostgreSQL connection string
    ssl: {
        rejectUnauthorized: false, // Required by Render for PostgreSQL connections
    },
});

// Connect to the database
client.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err);
        return;
    }
    console.log('Connected to PostgreSQL database.');
});

module.exports = client;

