const express = require('express');
const router = express.Router();
const {
  createHousehold,
  getHousehold,
  joinHousehold,
  getLeaderboard
} = require('../controllers/householdController');
const { protect } = require('../middleware/auth');

router.post('/', protect, createHousehold);
router.post('/join', protect, joinHousehold);
router.get('/:id', protect, getHousehold);
router.get('/:id/leaderboard', protect, getLeaderboard);

module.exports = router;
