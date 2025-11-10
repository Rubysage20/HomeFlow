const express = require('express');
const router = express.Router();
const {
  getUserRewards,
  getAvailableBadges,
  getLeaderboard,
  processUserRewards,
  getRewardStats,
} = require('../controllers/rewardController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getUserRewards);
router.get('/available', protect, getAvailableBadges);
router.get('/leaderboard', protect, getLeaderboard);
router.post('/process', protect, processUserRewards);
router.get('/stats', protect, getRewardStats);

module.exports = router;