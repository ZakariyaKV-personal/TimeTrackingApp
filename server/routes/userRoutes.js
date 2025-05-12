// routes/authRoutes.js
const express = require('express');
const { register, login, refreshToken, getAllUsers, updateUserStatus, getUserDetails, resetPassword } = require('../controllers/userController');
const authenticateToken = require('../middleware/auth'); // Import the authenticateToken middleware
const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/refresh-token', refreshToken);

// Protected routes - require authentication
router.get('/users', authenticateToken, getAllUsers); // Protect the /users route with JWT authentication
router.patch('/users/:id/status', authenticateToken, updateUserStatus); // Protect update user status
router.get('/profile/:id', authenticateToken, getUserDetails);
router.put('/profile/:id/password', authenticateToken, resetPassword);

module.exports = router;
