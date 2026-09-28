const express = require('express');
const router = express.Router();
const { getWorkspaces, createWorkspace } = require('../controllers/workspaceController');
const { protect } = require('../middleware/authMiddleware');
const { body } = require('express-validator');

router.route('/')
  .get(protect, getWorkspaces)
  .post(
    protect,
    [body('name', 'Workspace name is required').not().isEmpty()],
    createWorkspace
  );

module.exports = router;
