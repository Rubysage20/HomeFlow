const BADGES = {
  // Task Completion Badges
  GETTING_STARTED: {
    name: 'Getting Started',
    icon: '🌟',
    description: 'Complete your first task',
    requirement: { type: 'tasks_completed', count: 1 }
  },
  ON_A_ROLL: {
    name: 'On a Roll',
    icon: '🎯',
    description: 'Complete 5 tasks',
    requirement: { type: 'tasks_completed', count: 5 }
  },
  TASK_MASTER: {
    name: 'Task Master',
    icon: '🏆',
    description: 'Complete 10 tasks',
    requirement: { type: 'tasks_completed', count: 10 }
  },
  PRODUCTIVITY_PRO: {
    name: 'Productivity Pro',
    icon: '⚡',
    description: 'Complete 25 tasks',
    requirement: { type: 'tasks_completed', count: 25 }
  },
  LEGEND: {
    name: 'Legend',
    icon: '👑',
    description: 'Complete 50 tasks',
    requirement: { type: 'tasks_completed', count: 50 }
  },
  
  // Streak Badges
  HOT_START: {
    name: 'Hot Start',
    icon: '🔥',
    description: 'Maintain a 3-day streak',
    requirement: { type: 'streak_days', count: 3 }
  },
  ON_FIRE: {
    name: 'On Fire',
    icon: '🔥🔥',
    description: 'Maintain a 7-day streak',
    requirement: { type: 'streak_days', count: 7 }
  },
  UNSTOPPABLE: {
    name: 'Unstoppable',
    icon: '🔥🔥🔥',
    description: 'Maintain a 14-day streak',
    requirement: { type: 'streak_days', count: 14 }
  },
  
  // Points Badges
  BRONZE: {
    name: 'Bronze',
    icon: '🥉',
    description: 'Earn 50 total points',
    requirement: { type: 'total_points', count: 50 }
  },
  SILVER: {
    name: 'Silver',
    icon: '🥈',
    description: 'Earn 100 total points',
    requirement: { type: 'total_points', count: 100 }
  },
  GOLD: {
    name: 'Gold',
    icon: '🥇',
    description: 'Earn 250 total points',
    requirement: { type: 'total_points', count: 250 }
  },
  PLATINUM: {
    name: 'Platinum',
    icon: '💎',
    description: 'Earn 500 total points',
    requirement: { type: 'total_points', count: 500 }
  }
};

// Check and award badges
exports.checkAndAwardBadges = async (user, tasksCompleted) => {
  const newBadges = [];
  const existingBadgeNames = user.badges.map(b => b.name);
  
  for (const [key, badge] of Object.entries(BADGES)) {
    // Skip if already earned
    if (existingBadgeNames.includes(badge.name)) continue;
    
    let earned = false;
    
    switch (badge.requirement.type) {
      case 'tasks_completed':
        earned = tasksCompleted >= badge.requirement.count;
        break;
      case 'streak_days':
        earned = user.streakDays >= badge.requirement.count;
        break;
      case 'total_points':
        earned = user.totalLifetimePoints >= badge.requirement.count;
        break;
    }
    
    if (earned) {
      user.badges.push({
        name: badge.name,
        icon: badge.icon,
        earnedAt: new Date()
      });
      newBadges.push(badge);
    }
  }
  
  return newBadges;
};

exports.BADGES = BADGES;