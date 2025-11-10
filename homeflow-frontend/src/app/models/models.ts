export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'member';
  household?: string;
  maxDailyMinutes: number;
  pointsTotal: number;
  currentStreak: number;
  badges: string[];
  isActive: boolean;
  createdAt: Date;
}

export interface Household {
  _id: string;
  name: string;
  description?: string;
  createdBy: string;
  members: HouseholdMember[];
  inviteCode: string;
  settings: HouseholdSettings;
  isActive: boolean;
  createdAt: Date;
}

export interface HouseholdMember {
  user: User | string;
  role: 'admin' | 'member';
  joinedAt: Date;
}

export interface HouseholdSettings {
  autoAssignEnabled: boolean;
  gamificationEnabled: boolean;
  notificationsEnabled: boolean;
}

export interface Task {
  _id: string;
  title: string;
  description?: string;
  household: string;
  createdBy: User | string;
  assignedTo?: User | string;
  status: 'open' | 'assigned' | 'in-progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedMinutes: number;
  dueDate: Date | string;
  completedAt?: Date;
  points: number;
  tags: string[];
  recurring?: {
    enabled: boolean;
    frequency?: 'daily' | 'weekly' | 'monthly';
    nextOccurrence?: Date;
  };
  allowedAssignees?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResponse {
  success: boolean;
  data: {
    _id: string;
    name: string;
    email: string;
    role: string;
    household?: string;
    token: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  count?: number;
  message?: string;
}

export interface HouseholdStats {
  totalMembers: number;
  totalTasks: number;
  completedTasks: number;
  openTasks: number;
  completionRate: number;
}

export interface AutoAssignResult {
  success: boolean;
  message: string;
  assignments: TaskAssignment[];
  memberWorkloads: MemberWorkload[];
}

export interface TaskAssignment {
  taskId: string;
  taskTitle: string;
  assignedTo: string;
  assignedToId: string;
  estimatedMinutes: number;
  priority: string;
  dueDate: Date;
}

export interface MemberWorkload {
  userId: string;
  name: string;
  currentMinutes: number;
  availableMinutes: number;
  taskCount: number;
}

export interface Reward {
  _id: string;
  user: string;
  type: 'badge' | 'achievement' | 'milestone' | 'bonus';
  name: string;
  description: string;
  icon: string;
  pointsAwarded: number;
  earnedAt: Date;
  metadata?: any;
}

export interface Badge {
  name: string;
  description: string;
  icon: string;
  points: number;
}

export interface RewardStats {
  totalRewards: number;
  totalBadges: number;
  totalMilestones: number;
  totalPointsFromRewards: number;
  currentPoints: number;
  currentStreak: number;
  nextMilestone: any;
  badgesProgress: {
    earned: number;
    total: number;
    percentage: number;
  };
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  email: string;
  pointsTotal: number;
  currentStreak: number;
  badgeCount: number;
  household?: string;
}

