const express = require('express');
const router = express.Router();
const {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
  completeTask,
  autoAssignTasks,
  swapTask,
  getTasksByUser,
} = require('../controllers/taskController');
const { protect, authorize } = require('../middleware/auth');

// @route   POST /api/tasks
// @desc    Create a new task
// @access  Private
router.post('/', protect, createTask);

// @route   GET /api/tasks
// @desc    Get all tasks (with filters)
// @access  Private
router.get('/', protect, getTasks);

// @route   GET /api/tasks/user/:userId
// @desc    Get tasks for a specific user
// @access  Private
router.get('/user/:userId', protect, getTasksByUser);

// @route   GET /api/tasks/:id
// @desc    Get single task
// @access  Private
router.get('/:id', protect, getTask);

// @route   PUT /api/tasks/:id
// @desc    Update task
// @access  Private
router.put('/:id', protect, updateTask);

// @route   DELETE /api/tasks/:id
// @desc    Delete task
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), deleteTask);

// @route   PUT /api/tasks/:id/complete
// @desc    Mark task as completed
// @access  Private
router.put('/:id/complete', protect, completeTask);

// @route   POST /api/tasks/auto-assign
// @desc    Auto-assign all open tasks in household
// @access  Private/Admin
router.post('/auto-assign', protect, authorize('admin'), autoAssignTasks);

// @route   POST /api/tasks/:id/swap
// @desc    Request task swap with another user
// @access  Private
router.post('/:id/swap', protect, swapTask);

module.exports = router;
