const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createHousehold,
  getHousehold,
  joinHousehold
} = require('../controllers/householdController');

// All routes require authentication
router.use(protect);

router.post('/', createHousehold);
router.get('/:id', getHousehold);
router.get('/:id/leaderboard', getHousehold);
router.post('/join', joinHousehold);

module.exports = router;
