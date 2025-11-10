const User = require('../models/User');
const Reward = require('../models/Reward');
const Task = require('../models/Task');

const BADGES = {
  FIRST_TASK: {
    name: 'Getting Started',
    description: 'Completed your first task',
    icon: '🎯',
    points: 50,
    condition: (stats) => stats.completedTasks >= 1,
  },
  TASK_MASTER_10: {
    name: 'Task Master',
    description: 'Completed 10 tasks',
    icon: '⭐',
    points: 100,
    condition: (stats) => stats.completedTasks >= 10,
  },
  TASK_MASTER_50: {
    name: 'Task Champion',
    description: 'Completed 50 tasks',
    icon: '🏆',
    points: 250,
    condition: (stats) => stats.completedTasks >= 50,
  },
  TASK_MASTER_100: {
    name: 'Task Legend',
    description: 'Completed 100 tasks',
    icon: '👑',
    points: 500,
    condition: (stats) => stats.completedTasks >= 100,
  },
  STREAK_3: {
    name: 'On Fire',
    description: '3 day streak',
    icon: '🔥',
    points: 75,
    condition: (stats) => stats.currentStreak >= 3,
  },
  STREAK_7: {
    name: 'Week Warrior',
    description: '7 day streak',
    icon: '⚡',
    points: 150,
    condition: (stats) => stats.currentStreak >= 7,
  },
  STREAK_30: {
    name: 'Unstoppable',
    description: '30 day streak',
    icon: '💪',
    points: 500,
    condition: (stats) => stats.currentStreak >= 30,
  },
  EARLY_BIRD: {
    name: 'Early Bird',
    description: 'Completed 5 tasks before due date',
    icon: '🌅',
    points: 100,
    condition: (stats) => stats.earlyCompletions >= 5,
  },
  TEAM_PLAYER: {
    name: 'Team Player',
    description: 'Helped household complete 20 tasks',
    icon: '🤝',
    points: 200,
    condition: (stats) => stats.householdContribution >= 20,
  },
  SPEED_DEMON: {
    name: 'Speed Demon',
    description: 'Completed 5 tasks in under estimated time',
    icon: '⚡',
    points: 150,
    condition: (stats) => stats.fastCompletions >= 5,
  },
  POINT_COLLECTOR_500: {
    name: 'Point Collector',
    description: 'Earned 500 points',
    icon: '💎',
    points: 100,
    condition: (stats) => stats.totalPoints >= 500,
  },
  POINT_COLLECTOR_1000: {
    name: 'Point Master',
    description: 'Earned 1000 points',
    icon: '💰',
    points: 200,
    condition: (stats) => stats.totalPoints >= 1000,
  },
  NIGHT_OWL: {
    name: 'Night Owl',
    description: 'Completed 5 tasks after 8 PM',
    icon: '🦉',
    points: 100,
    condition: (stats) => stats.lateCompletions >= 5,
  },
  WEEKEND_WARRIOR: {
    name: 'Weekend Warrior',
    description: 'Completed 10 tasks on weekends',
    icon: '🎮',
    points: 150,
    condition: (stats) => stats.weekendCompletions >= 10,
  },
};

const MILESTONES = [
  { points: 100, name: 'Bronze Level', icon: '🥉', bonus: 25 },
  { points: 250, name: 'Silver Level', icon: '🥈', bonus: 50 },
  { points: 500, name: 'Gold Level', icon: '🥇', bonus: 100 },
  { points: 1000, name: 'Platinum Level', icon: '💎', bonus: 200 },
  { points: 2500, name: 'Diamond Level', icon: '💠', bonus: 500 },
  { points: 5000, name: 'Master Level', icon: '👑', bonus: 1000 },
];

const calculateUserStats = async (userId) => {
  const user = await User.findById(userId);
  const completedTasks = await Task.find({
    assignedTo: userId,
    status: 'completed',
  });

  const stats = {
    completedTasks: completedTasks.length,
    currentStreak: user.currentStreak,
    totalPoints: user.pointsTotal,
    earlyCompletions: 0,
    fastCompletions: 0,
    lateCompletions: 0,
    weekendCompletions: 0,
    householdContribution: completedTasks.length,
  };

  completedTasks.forEach((task) => {
    if (task.completedAt && task.dueDate) {
      // Early completion
      if (new Date(task.completedAt) < new Date(task.dueDate)) {
        stats.earlyCompletions++;
      }
      
      // Late night completion
      const hour = new Date(task.completedAt).getHours();
      if (hour >= 20 || hour <= 6) {
        stats.lateCompletions++;
      }

      // Weekend completion
      const day = new Date(task.completedAt).getDay();
      if (day === 0 || day === 6) {
        stats.weekendCompletions++;
      }
    }
  });

  return stats;
};

const checkAndAwardBadges = async (userId) => {
  const stats = await calculateUserStats(userId);
  const user = await User.findById(userId);
  const existingRewards = await Reward.find({ user: userId });
  const earnedBadgeNames = existingRewards.map((r) => r.name);
  
  const newRewards = [];

  for (const [key, badge] of Object.entries(BADGES)) {
    if (!earnedBadgeNames.includes(badge.name) && badge.condition(stats)) {
      const reward = await Reward.create({
        user: userId,
        type: 'badge',
        name: badge.name,
        description: badge.description,
        icon: badge.icon,
        pointsAwarded: badge.points,
        metadata: { badgeKey: key },
      });

      user.pointsTotal += badge.points;
      user.badges.push(badge.name);
      newRewards.push(reward);
    }
  }

  await user.save();
  return newRewards;
};

const checkAndAwardMilestones = async (userId) => {
  const user = await User.findById(userId);
  const existingRewards = await Reward.find({ user: userId, type: 'milestone' });
  const earnedMilestones = existingRewards.map((r) => r.name);
  
  const newMilestones = [];

  for (const milestone of MILESTONES) {
    if (user.pointsTotal >= milestone.points && !earnedMilestones.includes(milestone.name)) {
      const reward = await Reward.create({
        user: userId,
        type: 'milestone',
        name: milestone.name,
        description: `Reached ${milestone.points} points`,
        icon: milestone.icon,
        pointsAwarded: milestone.bonus,
        metadata: { threshold: milestone.points },
      });

      user.pointsTotal += milestone.bonus;
      newMilestones.push(reward);
    }
  }

  await user.save();
  return newMilestones;
};

const processRewards = async (userId) => {
  const badges = await checkAndAwardBadges(userId);
  const milestones = await checkAndAwardMilestones(userId);
  
  return {
    badges,
    milestones,
    totalNewPoints: [...badges, ...milestones].reduce((sum, r) => sum + r.pointsAwarded, 0),
  };
};

module.exports = {
  BADGES,
  MILESTONES,
  calculateUserStats,
  checkAndAwardBadges,
  checkAndAwardMilestones,
  processRewards,
};