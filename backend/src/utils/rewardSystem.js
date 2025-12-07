// Reward tiers
const REWARD_TIERS = [
  { points: 50, reward: 5 },
  { points: 100, reward: 10 },
  { points: 150, reward: 15 },
  { points: 200, reward: 20 }
];

// Calculate current reward value
exports.calculateReward = (points) => {
  let totalReward = 0;
  
  for (const tier of REWARD_TIERS) {
    if (points >= tier.points) {
      totalReward = tier.reward;
    } else {
      break;
    }
  }
  
  return totalReward;
};

// Calculate progress to next tier
exports.getNextReward = (points) => {
  for (const tier of REWARD_TIERS) {
    if (points < tier.points) {
      return {
        pointsNeeded: tier.points - points,
        rewardAmount: tier.reward,
        currentPoints: points
      };
    }
  }
  
  // Max tier reached
  return null;
};

// Check if it's time to reset (every Sunday midnight)
exports.shouldResetWeekly = (lastResetDate) => {
  if (!lastResetDate) return true;
  
  const now = new Date();
  const lastReset = new Date(lastResetDate);
  
  // Get the most recent Sunday
  const lastSunday = new Date(now);
  lastSunday.setDate(now.getDate() - now.getDay());
  lastSunday.setHours(0, 0, 0, 0);
  
  return lastReset < lastSunday;
};