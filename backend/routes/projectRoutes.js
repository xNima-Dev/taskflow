const express = require('express');
const router = express.Router();
const { getProjects, createProject } = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');
const { body } = require('express-validator');

router.route('/:workspaceId')
  .get(protect, getProjects)
  .post(
    protect,
    [body('name', 'Project name is required').not().isEmpty()],
    createProject
  );

module.exports = router;
