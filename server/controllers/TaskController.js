// controllers/task.controller.js
const Task = require('../models/Task');

// Create a new task
exports.createTask = (req, res) => {
    const newTask = req.body;
    Task.create(newTask, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: 'Task created successfully', taskId: result.insertId });
    });
};

// Get all tasks
exports.getAllTasks = (req, res) => {
    const domain = req.params.domain;
    Task.findAll(domain, (err, tasks) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(tasks);
    });
};

// Get tasks by project ID

exports.getTasksByProjectId = (req, res) => {
    const projectId = req.params.id;
    Task.findByProjectId(projectId, (err, tasks) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(tasks);
    });
};
// Get task by ID
exports.getTaskById = (req, res) => {
    const taskId = req.params.id;
    Task.findById(taskId, (err, task) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!task.length) return res.status(404).json({ error: 'Task not found' });
        res.json(task[0]);
    });
};

// Update task
exports.updateTask = (req, res) => {
    const taskId = req.params.id;
    const updatedTask = req.body;
    
    Task.update(taskId, updatedTask, (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Task updated successfully' });
    });
};

// Delete task
exports.deleteTask = (req, res) => {
    const taskId = req.params.id;
    Task.delete(taskId, (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Task deleted successfully' });
    });
};
exports.getTasksByUserId = (req, res) => {
    const userId = req.params.id; // Assuming `user.id` is added to `req` by the `authenticateToken` middleware
    const projectId = req.query.projectId;
    Task.findByUserId(userId,projectId, (err, tasks) => {
        if (err) {
            console.error('Error fetching tasks for user:', err);
            return res.status(500).json({ error: 'Failed to fetch tasks for the user' });
        }
        res.json(tasks);
    });
};