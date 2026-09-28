const Project = require('../models/Project');
const Workspace = require('../models/Workspace');
const { validationResult } = require('express-validator');

// @desc    Get projects for a workspace
// @route   GET /api/projects/:workspaceId
// @access  Private
const getProjects = async (req, res, next) => {
  try {
    // Check if user is member of workspace
    const workspace = await Workspace.findOne({
      _id: req.params.workspaceId,
      'members.user': req.user._id
    });

    if (!workspace) {
      res.status(403);
      return next(new Error('User is not a member of this workspace'));
    }

    const projects = await Project.find({ workspace: req.params.workspaceId });
    res.status(200).json(projects);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a project
// @route   POST /api/projects/:workspaceId
// @access  Private
const createProject = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    return next(new Error(errors.array()[0].msg));
  }

  const { name, description } = req.body;

  try {
    // Check workspace membership
    const workspace = await Workspace.findOne({
      _id: req.params.workspaceId,
      'members.user': req.user._id
    });

    if (!workspace) {
      res.status(403);
      return next(new Error('User is not a member of this workspace'));
    }

    const project = await Project.create({
      name,
      description,
      workspace: req.params.workspaceId
    });

    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProjects,
  createProject
};
