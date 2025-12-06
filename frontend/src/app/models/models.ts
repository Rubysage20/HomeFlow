export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  household?: string;
  points: number;
  badges: Badge[];
  streakDays: number;
  lastTaskCompletedDate?: Date;
  createdAt: Date;
}

export interface Badge {
  name: string;
  earnedAt: Date;
}

export interface Household {
  _id: string;
  name: string;
  description?: string;
  creator: string | User;
  members: HouseholdMember[];
  inviteCode: string;
  createdAt: Date;
}

export interface HouseholdMember {
  user: User;
  role: 'owner' | 'admin' | 'member';
  joinedAt: Date;
}

export interface Task {
  _id: string;
  title: string;
  description?: string;
  household: string;
  assignedTo?: User;
  createdBy: User;
  priority: 'low' | 'medium' | 'high';
  category: 'cleaning' | 'cooking' | 'shopping' | 'maintenance' | 'childcare' | 'petcare' | 'other';
  status: 'pending' | 'in-progress' | 'completed';
  dueDate?: Date;
  points: number;
  recurring: {
    isRecurring: boolean;
    frequency?: 'daily' | 'weekly' | 'monthly';
  };
  completedAt?: Date;
  completedBy?: User;
  createdAt: Date;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface TaskCompletionResponse {
  success: boolean;
  task: Task;
  pointsEarned: number;
  newTotalPoints?: number;
  newPoints?: number;
  newLevel?: number;
  streakDays?: number;
  newBadges?: Badge[];
}