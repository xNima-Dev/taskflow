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

// @desc    Get single workspace by ID
// @route   GET /api/workspaces/:id
// @access  Private
const getWorkspaceById = async (req, res, next) => {
  try {
    const workspace = await Workspace.findOne({
      _id: req.params.id,
      'members.user': req.user._id
    }).populate('owner', 'name email').populate('members.user', 'name email');

    if (!workspace) {
      res.status(404);
      return next(new Error('Workspace not found or unauthorized'));
    }

    res.status(200).json(workspace);
  } catch (error) {
    next(error);
  }
};

// @desc    Add member to workspace (RBAC: Admin only)
// @route   POST /api/workspaces/:id/members
// @access  Private
const addMember = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    return next(new Error(errors.array()[0].msg));
  }

  const { email, role } = req.body;

  try {
    const workspace = await Workspace.findById(req.params.id);
    if (!workspace) {
      res.status(404);
      return next(new Error('Workspace not found'));
    }

    // RBAC: Verify requesting user is an admin of this workspace
    const requesterMember = workspace.members.find(
      (m) => m.user.toString() === req.user._id.toString()
    );

    if (!requesterMember || requesterMember.role !== 'admin') {
      res.status(403);
      return next(new Error('Access denied: Only workspace admins can invite new members'));
    }

    const User = require('../models/User');
    const userToAdd = await User.findOne({ email: email.toLowerCase() });
    if (!userToAdd) {
      res.status(404);
      return next(new Error('No registered user found with that email address'));
    }

    // Check if already a member
    const alreadyMember = workspace.members.some(
      (m) => m.user.toString() === userToAdd._id.toString()
    );
    if (alreadyMember) {
      res.status(400);
      return next(new Error('User is already a member of this workspace'));
    }

    workspace.members.push({
      user: userToAdd._id,
      role: role === 'admin' ? 'admin' : 'member'
    });

    await workspace.save();

    const updatedWorkspace = await Workspace.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('members.user', 'name email');

    res.status(200).json(updatedWorkspace);
  } catch (error) {
    next(error);
  }
};

// @desc    Remove member from workspace (RBAC: Admin or Self)
// @route   DELETE /api/workspaces/:id/members/:userId
// @access  Private
const removeMember = async (req, res, next) => {
  try {
    const workspace = await Workspace.findById(req.params.id);
    if (!workspace) {
      res.status(404);
      return next(new Error('Workspace not found'));
    }

    const requesterMember = workspace.members.find(
      (m) => m.user.toString() === req.user._id.toString()
    );

    const isSelf = req.user._id.toString() === req.params.userId;
    const isAdmin = requesterMember && requesterMember.role === 'admin';

    if (!isAdmin && !isSelf) {
      res.status(403);
      return next(new Error('Access denied: Only admins can remove members'));
    }

    if (workspace.owner.toString() === req.params.userId) {
      res.status(400);
      return next(new Error('Cannot remove the workspace owner'));
    }

    workspace.members = workspace.members.filter(
      (m) => m.user.toString() !== req.params.userId
    );

    await workspace.save();

    const updatedWorkspace = await Workspace.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('members.user', 'name email');

    res.status(200).json(updatedWorkspace);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWorkspaces,
  getWorkspaceById,
  createWorkspace,
  addMember,
  removeMember
};
