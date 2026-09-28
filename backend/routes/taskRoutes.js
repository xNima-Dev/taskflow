const express = require('express');
const router = express.Router();
const { getTasks, createTask, updateTask, deleteTask } = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');
const { body } = require('express-validator');

router.route('/project/:projectId')
  .get(protect, getTasks)
  .post(
    protect,
    [body('title', 'Task title is required').not().isEmpty()],
    createTask
  );

router.route('/:id')
  .put(protect, updateTask)
  .delete(protect, deleteTask);

module.exports = router;
