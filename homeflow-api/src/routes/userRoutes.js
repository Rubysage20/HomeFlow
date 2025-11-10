const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  updateUserPoints,
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/users
// @desc    Get all users in household
// @access  Private
router.get('/', protect, getUsers);

// @route   GET /api/users/:id
// @desc    Get single user
// @access  Private
router.get('/:id', protect, getUser);

// @route   PUT /api/users/:id
// @desc    Update user
// @access  Private
router.put('/:id', protect, updateUser);

// @route   DELETE /api/users/:id
// @desc    Delete user
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), deleteUser);

// @route   PUT /api/users/:id/points
// @desc    Update user points
// @access  Private
router.put('/:id/points', protect, updateUserPoints);

module.exports = router;
