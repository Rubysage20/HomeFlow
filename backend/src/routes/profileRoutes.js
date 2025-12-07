const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getProfile,
  updateProfile,
  uploadAvatar
} = require('../controllers/profileController');

router.use(protect);

router.route('/')
  .get(getProfile)
  .put(updateProfile);

router.post('/avatar', uploadAvatar);

module.exports = router;