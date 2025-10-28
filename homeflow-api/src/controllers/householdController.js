const Household = require('../models/Household');
const User = require('../models/User');
const Task = require('../models/Task');

// @desc    Create new household
// @route   POST /api/households
// @access  Private
exports.createHousehold = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    const household = await Household.create({
      name,
      description,
      createdBy: req.user._id,
      members: [
        {
          user: req.user._id,
          role: 'admin',
        },
      ],
    });

    // Update user's household
    await User.findByIdAndUpdate(req.user._id, {
      household: household._id,
      role: 'admin',
    });

    res.status(201).json({
      success: true,
      data: household,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all households for user
// @route   GET /api/households
// @access  Private
exports.getHouseholds = async (req, res, next) => {
  try {
    const households = await Household.find({
      'members.user': req.user._id,
    }).populate('members.user', 'name email');

    res.status(200).json({
      success: true,
      count: households.length,
      data: households,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single household
// @route   GET /api/households/:id
// @access  Private
exports.getHousehold = async (req, res, next) => {
  try {
    const household = await Household.findById(req.params.id).populate(
      'members.user',
      'name email pointsTotal currentStreak'
    );

    if (!household) {
      return res.status(404).json({
        success: false,
        message: 'Household not found',
      });
    }

    // Check if user is member
    const isMember = household.members.some(
      (member) => member.user._id.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this household',
      });
    }

    res.status(200).json({
      success: true,
      data: household,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update household
// @route   PUT /api/households/:id
// @access  Private/Admin
exports.updateHousehold = async (req, res, next) => {
  try {
    const household = await Household.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!household) {
      return res.status(404).json({
        success: false,
        message: 'Household not found',
      });
    }

    res.status(200).json({
      success: true,
      data: household,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete household
// @route   DELETE /api/households/:id
// @access  Private/Admin
exports.deleteHousehold = async (req, res, next) => {
  try {
    const household = await Household.findById(req.params.id);

    if (!household) {
      return res.status(404).json({
        success: false,
        message: 'Household not found',
      });
    }

    await household.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Household deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Join household with invite code
// @route   POST /api/households/join
// @access  Private
exports.joinHousehold = async (req, res, next) => {
  try {
    const { inviteCode } = req.body;

    const household = await Household.findOne({ inviteCode });

    if (!household) {
      return res.status(404).json({
        success: false,
        message: 'Invalid invite code',
      });
    }

    // Check if already a member
    const isMember = household.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (isMember) {
      return res.status(400).json({
        success: false,
        message: 'You are already a member of this household',
      });
    }

    // Add user to household
    household.members.push({
      user: req.user._id,
      role: 'member',
    });
    await household.save();

    // Update user's household
    await User.findByIdAndUpdate(req.user._id, {
      household: household._id,
    });

    res.status(200).json({
      success: true,
      data: household,
      message: 'Successfully joined household',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Leave household
// @route   POST /api/households/:id/leave
// @access  Private
exports.leaveHousehold = async (req, res, next) => {
  try {
    const household = await Household.findById(req.params.id);

    if (!household) {
      return res.status(404).json({
        success: false,
        message: 'Household not found',
      });
    }

    // Remove user from household
    household.members = household.members.filter(
      (member) => member.user.toString() !== req.user._id.toString()
    );
    await household.save();

    // Update user
    await User.findByIdAndUpdate(req.user._id, {
      household: null,
    });

    res.status(200).json({
      success: true,
      message: 'Successfully left household',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove member from household
// @route   DELETE /api/households/:id/members/:userId
// @access  Private/Admin
exports.removeMember = async (req, res, next) => {
  try {
    const household = await Household.findById(req.params.id);

    if (!household) {
      return res.status(404).json({
        success: false,
        message: 'Household not found',
      });
    }

    // Remove member
    household.members = household.members.filter(
      (member) => member.user.toString() !== req.params.userId
    );
    await household.save();

    // Update user
    await User.findByIdAndUpdate(req.params.userId, {
      household: null,
    });

    res.status(200).json({
      success: true,
      message: 'Member removed successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get household statistics
// @route   GET /api/households/:id/stats
// @access  Private
exports.getHouseholdStats = async (req, res, next) => {
  try {
    const household = await Household.findById(req.params.id);

    if (!household) {
      return res.status(404).json({
        success: false,
        message: 'Household not found',
      });
    }

    // Get task statistics
    const totalTasks = await Task.countDocuments({ household: req.params.id });
    const completedTasks = await Task.countDocuments({
      household: req.params.id,
      status: 'completed',
    });
    const openTasks = await Task.countDocuments({
      household: req.params.id,
      status: 'open',
    });

    res.status(200).json({
      success: true,
      data: {
        totalMembers: household.members.length,
        totalTasks,
        completedTasks,
        openTasks,
        completionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
      },
    });
  } catch (error) {
    next(error);
  }
};
