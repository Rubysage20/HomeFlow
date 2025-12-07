const User = require('../models/User');

// @desc    Get user profile
// @route   GET /api/profile
// @access  Private
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile',
      error: error.message
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { name, bio, favoriteColor, theme, avatar } = req.body;
    
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update allowed fields
    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (favoriteColor) user.favoriteColor = favoriteColor;
    if (theme) user.theme = theme;
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();

    // Return user without password
    const updatedUser = await User.findById(user._id).select('-password');

    res.json({
      success: true,
      user: updatedUser
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
};

// @desc    Upload avatar (base64)
// @route   POST /api/profile/avatar
// @access  Private
exports.uploadAvatar = async (req, res) => {
  try {
    const { avatar } = req.body;
    
    if (!avatar) {
      return res.status(400).json({
        success: false,
        message: 'No avatar data provided'
      });
    }

    // Validate base64 image (basic check)
    if (!avatar.startsWith('data:image/')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid image format'
      });
    }

    const user = await User.findById(req.user.id);
    user.avatar = avatar;
    await user.save();

    res.json({
      success: true,
      avatar: user.avatar
    });
  } catch (error) {
    console.error('Upload avatar error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading avatar',
      error: error.message
    });
  }
};