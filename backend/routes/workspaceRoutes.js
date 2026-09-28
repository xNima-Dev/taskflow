const express = require('express');
const router = express.Router();
const {
  getWorkspaces,
  getWorkspaceById,
  createWorkspace,
  addMember,
  removeMember
} = require('../controllers/workspaceController');
const { protect } = require('../middleware/authMiddleware');
const { body } = require('express-validator');

router.route('/')
  .get(protect, getWorkspaces)
  .post(
    protect,
    [body('name', 'Workspace name is required').not().isEmpty().trim()],
    createWorkspace
  );

router.route('/:id')
  .get(protect, getWorkspaceById);

router.route('/:id/members')
  .post(
    protect,
    [
      body('email', 'Valid email is required').isEmail().normalizeEmail(),
      body('role', 'Role must be admin or member').optional().isIn(['admin', 'member'])
    ],
    addMember
  );

router.route('/:id/members/:userId')
  .delete(protect, removeMember);

module.exports = router;
