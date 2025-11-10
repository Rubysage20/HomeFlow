const express = require('express');
const router = express.Router();
const {
  createHousehold,
  getHouseholds,
  getHousehold,
  updateHousehold,
  deleteHousehold,
  joinHousehold,
  leaveHousehold,
  removeMember,
  getHouseholdStats,
} = require('../controllers/householdController');
const { protect, authorize } = require('../middleware/auth');

// @route   POST /api/households
// @desc    Create a new household
// @access  Private
router.post('/', protect, createHousehold);

// @route   GET /api/households
// @desc    Get all households for logged in user
// @access  Private
router.get('/', protect, getHouseholds);

// @route   GET /api/households/:id
// @desc    Get single household
// @access  Private
router.get('/:id', protect, getHousehold);

// @route   PUT /api/households/:id
// @desc    Update household
// @access  Private/Admin
router.put('/:id', protect, authorize('admin'), updateHousehold);

// @route   DELETE /api/households/:id
// @desc    Delete household
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), deleteHousehold);

// @route   POST /api/households/join
// @desc    Join household with invite code
// @access  Private
router.post('/join', protect, joinHousehold);

// @route   POST /api/households/:id/leave
// @desc    Leave household
// @access  Private
router.post('/:id/leave', protect, leaveHousehold);

// @route   DELETE /api/households/:id/members/:userId
// @desc    Remove member from household
// @access  Private/Admin
router.delete('/:id/members/:userId', protect, authorize('admin'), removeMember);

// @route   GET /api/households/:id/stats
// @desc    Get household statistics
// @access  Private
router.get('/:id/stats', protect, getHouseholdStats);

module.exports = router;
