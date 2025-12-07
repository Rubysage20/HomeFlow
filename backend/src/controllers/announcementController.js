const Announcement = require('../models/Announcement');
const User = require('../models/User');
const Household = require('../models/Household');

// @desc    Create announcement
// @route   POST /api/announcements
// @access  Private (admin only)
exports.createAnnouncement = async (req, res) => {
  try {
    const { title, message, type, expiresAt } = req.body;
    
    const user = await User.findById(req.user.id);
    
    if (!user.household) {
      return res.status(400).json({
        success: false,
        message: 'You must be part of a household'
      });
    }

    // Check if user is admin
    const household = await Household.findById(user.household);
    const member = household.members.find(m => m.user.toString() === req.user.id);
    
    if (!member || member.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can create announcements'
      });
    }

    const announcement = await Announcement.create({
      household: user.household,
      title,
      message,
      type: type || 'info',
      createdBy: req.user.id,
      expiresAt: expiresAt || null
    });

    const populatedAnnouncement = await Announcement.findById(announcement._id)
      .populate('createdBy', 'name');

    res.status(201).json({
      success: true,
      announcement: populatedAnnouncement
    });
  } catch (error) {
    console.error('Create announcement error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating announcement',
      error: error.message
    });
  }
};

// @desc    Get all announcements for household
// @route   GET /api/announcements
// @access  Private
exports.getAnnouncements = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user.household) {
      return res.status(400).json({
        success: false,
        message: 'You must be part of a household'
      });
    }

    const announcements = await Announcement.find({ 
      household: user.household,
      $or: [
        { expiresAt: null },
        { expiresAt: { $gt: new Date() } }
      ]
    })
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      announcements
    });
  } catch (error) {
    console.error('Get announcements error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching announcements',
      error: error.message
    });
  }
};

// @desc    Delete announcement
// @route   DELETE /api/announcements/:id
// @access  Private (admin only)
exports.deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    await announcement.deleteOne();

    res.json({
      success: true,
      message: 'Announcement deleted'
    });
  } catch (error) {
    console.error('Delete announcement error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting announcement',
      error: error.message
    });
  }
};