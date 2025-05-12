const Project = require('../models/Project');

exports.createProject = (req, res) => {
    const { users_id, name, description, domain } = req.body;

    Project.create(users_id, name, description, domain, (err, results) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        res.status(201).json({ message: 'Project created', projectId: results.insertId });
    });
};

exports.updateProject = (req, res) => {
    const { id } = req.params;
    const {users_id, name, description, domain } = req.body;
    
    Project.update(id, users_id, name, description, domain, (err) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        res.json({ message: 'Project updated' });
    });
};

exports.deleteProject = (req, res) => {
    const { id } = req.params;
    
    Project.delete(id, (err) => {
        if (err) {
            console.error("Error deleting project:", err.message); // Log the detailed error message
            return res.status(500).json({ message: 'Database error', error: err.message });
        }
        res.json({ message: 'Project deleted successfully' });
    });
};

exports.getProjects = (req, res) => {
    const { domain } = req.params;
    
    Project.findAll(domain, (err, results) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        res.json(results);
    });
};

// Assuming `Project` is your model where `findById` is implemented
exports.getProjectsById = (req, res) => {
    const userId  = req.params.userId; // Assuming userId is passed as a URL parameter
    // Ensure userId is a valid number
    if (!userId) {
        return res.status(400).json({ message: 'Invalid user ID' });
    }

    Project.findById(userId, (err, results) => {
        if (err) {
            console.error('Error fetching projects:', err);
            return res.status(500).json({ message: 'Database error' });
        }

        // Check if results are found and return the projects
        if (results && results.length > 0) {
            return res.json(results);
        } else {
            return res.status(500).json({ message: 'No projects found for this user'});
        }
    });
};