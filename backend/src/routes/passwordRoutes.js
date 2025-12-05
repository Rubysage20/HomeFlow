const express = require('express');
const router = express.Router();
const { forgotPassword, resetPassword } = require('../controllers/passwordController');

// POST /api/password/forgot - Request password reset
router.post('/forgot', forgotPassword);

// POST /api/password/reset/:token - Reset password with token
router.post('/reset/:token', resetPassword);

module.exports = router;