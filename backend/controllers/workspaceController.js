const Workspace = require('../models/Workspace');
const { validationResult } = require('express-validator');

// @desc    Get user workspaces
// @route   GET /api/workspaces
// @access  Private
const getWorkspaces = async (req, res, next) => {
  try {
    const workspaces = await Workspace.find({
      'members.user': req.user._id
    }).populate('owner', 'name email').populate('members.user', 'name email');
    res.status(200).json(workspaces);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a workspace
// @route   POST /api/workspaces
// @access  Private
const createWorkspace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    return next(new Error(errors.array()[0].msg));
  }

  const { name } = req.body;

  try {
    const workspace = await Workspace.create({
      name,
      owner: req.user._id,
      members: [{ user: req.user._id, role: 'admin' }]
    });

    res.status(201).json(workspace);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWorkspaces,
  createWorkspace
};
