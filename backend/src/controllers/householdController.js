const Household = require('../models/Household');
const User = require('../models/User');

// @desc    Create new household
// @route   POST /api/households
// @access  Private
exports.createHousehold = async (req, res) => {
  try {
    const { name } = req.body;
    
    // Create household
    const household = await Household.create({
      name,
      createdBy: req.user.id,
      members: [{
        user: req.user.id,
        role: 'admin'
      }]
    });

    // Update user's household
    await User.findByIdAndUpdate(req.user.id, {
      household: household._id
    });

    res.status(201).json({
      success: true,
      household
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
exports.getHousehold = async (req, res) => {
  try {
    const household = await Household.findById(req.params.id)
      .populate('members.user', 'name email points level');
    
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
exports.joinHousehold = async (req, res) => {
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

    // Add user to household
    household.members.push({
      user: req.user.id,
      role: 'member'
    });
    await household.save();

    // Update user's household
    await User.findByIdAndUpdate(req.user.id, {
      household: household._id
    });

    res.json({
      success: true,
      message: 'Successfully joined household',
      household
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

// @desc    Get household leaderboard
// @route   GET /api/households/:id/leaderboard
// @access  Private
exports.getLeaderboard = async (req, res) => {
  try {
    const household = await Household.findById(req.params.id)
      .populate({
        path: 'members.user',
        select: 'name points level badges'
      });
    
    if (!household) {
      return res.status(404).json({
        success: false,
        message: 'Household not found'
      });
    }

    // Sort members by points
    const leaderboard = household.members
      .map(member => member.user)
      .sort((a, b) => b.points - a.points);

    res.json({
      success: true,
      leaderboard
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching leaderboard',
      error: error.message
    });
  }
};
