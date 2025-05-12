// routes/task.routes.js
const express = require('express');
const router = express.Router();
const taskController = require('../controllers/TaskController');
const authenticateToken = require('../middleware/auth');

// Define routes for tasks with authentication
router.post('/', authenticateToken, taskController.createTask);               // Create a new task
router.get('/alltasks/:domain', authenticateToken, taskController.getAllTasks);       // Get all tasks
router.get('/:id', authenticateToken, taskController.getTaskById);            // Get task by ID
router.put('/:id', authenticateToken, taskController.updateTask);             // Update task
router.delete('/:id', authenticateToken, taskController.deleteTask);          // Delete task
router.get('/usertasks/:id', authenticateToken, taskController.getTasksByUserId); // Get tasks by user ID
router.get('/project/:id', authenticateToken, taskController.getTasksByProjectId); // Get tasks by project ID

module.exports = router;
