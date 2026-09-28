const Task = require('../models/Task');
const Project = require('../models/Project');
const Workspace = require('../models/Workspace');
const { validationResult } = require('express-validator');

// Helper to check access
const checkProjectAccess = async (projectId, userId) => {
  const project = await Project.findById(projectId);
  if (!project) return null;
  const workspace = await Workspace.findOne({
    _id: project.workspace,
    'members.user': userId
  });
  return workspace ? project : null;
};

// @desc    Get tasks for a project
// @route   GET /api/tasks/project/:projectId
// @access  Private
const getTasks = async (req, res, next) => {
  try {
    const project = await checkProjectAccess(req.params.projectId, req.user._id);
    if (!project) {
      res.status(403);
      return next(new Error('Not authorized to access tasks for this project'));
    }

    const tasks = await Task.find({ project: req.params.projectId })
      .populate('assigneeId', 'name email');
    res.status(200).json(tasks);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a task
// @route   POST /api/tasks/project/:projectId
// @access  Private
const createTask = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    return next(new Error(errors.array()[0].msg));
  }

  const { title, description, status, priority, dueDate, assigneeId } = req.body;

  try {
    const project = await checkProjectAccess(req.params.projectId, req.user._id);
    if (!project) {
      res.status(403);
      return next(new Error('Not authorized to create task in this project'));
    }

    const task = await Task.create({
      title,
      description,
      status: status || 'todo',
      priority: priority || 'medium',
      dueDate,
      assigneeId,
      project: req.params.projectId
    });

    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      res.status(404);
      return next(new Error('Task not found'));
    }

    const project = await checkProjectAccess(task.project, req.user._id);
    if (!project) {
      res.status(403);
      return next(new Error('Not authorized to update this task'));
    }

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('assigneeId', 'name email');

    res.status(200).json(updatedTask);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      res.status(404);
      return next(new Error('Task not found'));
    }

    const project = await checkProjectAccess(task.project, req.user._id);
    if (!project) {
      res.status(403);
      return next(new Error('Not authorized to delete this task'));
    }

    await Task.findByIdAndDelete(req.params.id);
    res.status(200).json({ id: req.params.id });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask
};
