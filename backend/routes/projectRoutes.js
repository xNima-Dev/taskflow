const express = require('express');
const router = express.Router();
const { getProjects, getProjectById, createProject } = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');
const { body } = require('express-validator');

router.route('/detail/:projectId')
  .get(protect, getProjectById);

router.route('/:workspaceId')
  .get(protect, getProjects)
  .post(
    protect,
    [body('name', 'Project name is required').not().isEmpty().trim()],
    createProject
  );

module.exports = router;
