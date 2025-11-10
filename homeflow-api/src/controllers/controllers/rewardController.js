const Reward = require('../models/Reward');
const User = require('../models/User');
const { processRewards, BADGES, MILESTONES } = require('../utils/rewardSystem');

// @desc    Get all rewards for user
// @route   GET /api/rewards
// @access  Private
exports.getUserRewards = async (req, res, next) => {
  try {
    const rewards = await Reward.find({ user: req.user._id }).sort({ earnedAt: -1 });

    res.status(200).json({
      success: true,
      count: rewards.length,
      data: rewards,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get available badges (not yet earned)
// @route   GET /api/rewards/available
// @access  Private
exports.getAvailableBadges = async (req, res, next) => {
  try {
    const earnedRewards = await Reward.find({ user: req.user._id });
    const earnedNames = earnedRewards.map((r) => r.name);

    const available = Object.values(BADGES).filter(
      (badge) => !earnedNames.includes(badge.name)
    );

    res.status(200).json({
      success: true,
      count: available.length,
      data: available,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get leaderboard
// @route   GET /api/rewards/leaderboard
// @access  Private
exports.getLeaderboard = async (req, res, next) => {
  try {
    const { household } = req.query;
    
    const query = household ? { household } : {};
    
    const users = await User.find(query)
      .select('name email pointsTotal currentStreak badges household')
      .sort({ pointsTotal: -1 })
      .limit(100);

    const leaderboard = users.map((user, index) => ({
      rank: index + 1,
      userId: user._id,
      name: user.name,
      email: user.email,
      pointsTotal: user.pointsTotal,
      currentStreak: user.currentStreak,
      badgeCount: user.badges.length,
      household: user.household,
    }));

    res.status(200).json({
      success: true,
      count: leaderboard.length,
      data: leaderboard,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Process rewards for user (check for new badges/milestones)
// @route   POST /api/rewards/process
// @access  Private
exports.processUserRewards = async (req, res, next) => {
  try {
    const result = await processRewards(req.user._id);

    res.status(200).json({
      success: true,
      data: result,
      message: result.badges.length + result.milestones.length > 0 
        ? `Congratulations! You earned ${result.badges.length} badge(s) and ${result.milestones.length} milestone(s)!`
        : 'No new rewards at this time',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get reward stats
// @route   GET /api/rewards/stats
// @access  Private
exports.getRewardStats = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const rewards = await Reward.find({ user: req.user._id });

    const stats = {
      totalRewards: rewards.length,
      totalBadges: rewards.filter((r) => r.type === 'badge').length,
      totalMilestones: rewards.filter((r) => r.type === 'milestone').length,
      totalPointsFromRewards: rewards.reduce((sum, r) => sum + r.pointsAwarded, 0),
      currentPoints: user.pointsTotal,
      currentStreak: user.currentStreak,
      nextMilestone: MILESTONES.find((m) => m.points > user.pointsTotal) || null,
      badgesProgress: {
        earned: user.badges.length,
        total: Object.keys(BADGES).length,
        percentage: Math.round((user.badges.length / Object.keys(BADGES).length) * 100),
      },
    };

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};