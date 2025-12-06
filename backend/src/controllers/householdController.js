const Household = require('../models/Household');
const User = require('../models/User');
const crypto = require('crypto');

// @desc    Create household
// @route   POST /api/households
// @access  Private
const createHousehold = async (req, res) => {
  try {
    const { name, description } = req.body;

    // Generate unique invite code
    const inviteCode = crypto.randomBytes(4).toString('hex').toUpperCase();

    const household = await Household.create({
      name,
      description,
      creator: req.user.id,
      inviteCode,
      members: [{
        user: req.user.id,
        role: 'admin'
      }]
    });

    // Update user's household reference
    await User.findByIdAndUpdate(req.user.id, {
      household: household._id
    });

    const populatedHousehold = await Household.findById(household._id)
      .populate('members.user', 'name email points streakDays');

    res.status(201).json({
      success: true,
      household: populatedHousehold
    });
  } catch (error) {
    console.error('Create household error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating household',
      error: error.message
    });
  }
};

// @desc    Get household details
// @route   GET /api/households/:id
// @access  Private
const getHousehold = async (req, res) => {
  try {
    const household = await Household.findById(req.params.id)
      .populate('members.user', 'name email points streakDays badges');

    if (!household) {
      return res.status(404).json({
        success: false,
        message: 'Household not found'
      });
    }

    res.json({
      success: true,
      household
    });
  } catch (error) {
    console.error('Get household error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching household',
      error: error.message
    });
  }
};

// @desc    Join household with invite code
// @route   POST /api/households/join
// @access  Private
const joinHousehold = async (req, res) => {
  try {
    const { inviteCode } = req.body;

    const household = await Household.findOne({ inviteCode });

    if (!household) {
      return res.status(404).json({
        success: false,
        message: 'Invalid invite code'
      });
    }

    // Check if user is already a member
    const isMember = household.members.some(
      member => member.user.toString() === req.user.id
    );

    if (isMember) {
      return res.status(400).json({
        success: false,
        message: 'You are already a member of this household'
      });
    }

    // Add user to household as regular member
    household.members.push({
      user: req.user.id,
      role: 'member'
    });
    await household.save();

    // Update user's household reference
    await User.findByIdAndUpdate(req.user.id, {
      household: household._id
    });

    const populatedHousehold = await Household.findById(household._id)
      .populate('members.user', 'name email points streakDays');

    res.json({
      success: true,
      household: populatedHousehold
    });
  } catch (error) {
    console.error('Join household error:', error);
    res.status(500).json({
      success: false,
      message: 'Error joining household',
      error: error.message
    });
  }
};

module.exports = {
  createHousehold,
  getHousehold,
  joinHousehold
};
