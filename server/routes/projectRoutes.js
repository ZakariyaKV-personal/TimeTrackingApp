const express = require('express');
const router = express.Router();
const ProjectController = require('../controllers/ProjectController');
const authenticateToken = require('../middleware/auth');

router.post('/', authenticateToken, ProjectController.createProject);
router.put('/:id', authenticateToken, ProjectController.updateProject);
router.delete('/:id', authenticateToken, ProjectController.deleteProject);
router.get('/:domain', authenticateToken, ProjectController.getProjects);
router.get('/byid/:userId', authenticateToken, ProjectController.getProjectsById);

module.exports = router;
