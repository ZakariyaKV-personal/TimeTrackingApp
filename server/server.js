const express = require('express');
const bodyParser = require('body-parser');
const path = require('path'); // ✅ Fix: import 'path' here
require('dotenv').config();
const cors = require('cors');

const authRoutes = require('./routes/userRoutes');
const projectRoutes = require('./routes/projectRoutes');
const timeEntryRoutes = require('./routes/timeEntryRoutes');
const reportRoutes = require('./routes/reportRoutes');
const taskRoutes = require('./routes/taskRoutes');
const commonLeavesRoutes = require('./routes/commonLeaveRoutes');
const leaveRoutes = require('./routes/leaveRoutes');
const meetingRoutes = require('./routes/meetingRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/timeentries', timeEntryRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/commonleave', commonLeavesRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/meetings', meetingRoutes);

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../client/build')));

// For any routes not caught by API, send React index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
