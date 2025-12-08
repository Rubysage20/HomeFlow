import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '../../services/auth.service';
import { TaskService } from '../../services/task.service';
import { HouseholdService } from '../../services/household.service';
import { AnnouncementService } from '../../services/announcement.service';  
import { User, Task, Household } from '../../models/models';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  tasks: Task[] = [];
  household: Household | null = null;
  leaderboard: User[] = [];
  householdMembers: User[] = [];
  
  stats = {
    totalPoints: 0,
    completedTasks: 0,
    streakDays: 0,
    pendingTasks: 0
  };

   announcements: any[] = [];
  showAnnouncementDialog = false;
  newAnnouncement = {
    title: '',
    message: '',
    type: 'info' as 'info' | 'important' | 'celebration' | 'reminder',
    expiresAt: ''
  };
  rewardProgress: any = null;

  isLoading = true;
  showCreateTask = false;
  editingTask: Task | null = null;

  newTask = {
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    category: 'other' as 'cleaning' | 'cooking' | 'shopping' | 'maintenance' | 'childcare' | 'petcare' | 'other',
    assignedTo: '',
    dueDate: ''
  };

  constructor(
    private authService: AuthService,
    private taskService: TaskService,
    private householdService: HouseholdService,
    private announcementService: AnnouncementService,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadUserData();
    this.loadAnnouncements();
  }

  loadUserData(): void {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.currentUser = user;
        this.stats.totalPoints = user.points;
        this.stats.streakDays = user.streakDays;

          // Calculate reward progress
        if (user.weeklyPoints !== undefined) {
          this.calculateRewardProgress(user.weeklyPoints);
        }
        
        if (user.household) {
          // Extract household ID if it's an object
          const householdId = typeof user.household === 'string' 
            ? user.household 
            : (user.household as any)._id || (user.household as any).id;
          
          if (householdId) {
            this.loadHouseholdData(householdId);
          }
        }
        
        this.loadTasks();
      }
    });
  }

  calculateRewardProgress(weeklyPoints: number): void {
    const rewardTiers = [
      { points: 50, reward: 5 },
      { points: 100, reward: 10 },
      { points: 150, reward: 15 },
      { points: 200, reward: 20 }
    ];

    // Find next reward tier
    for (const tier of rewardTiers) {
      if (weeklyPoints < tier.points) {
        this.rewardProgress = {
          pointsNeeded: tier.points - weeklyPoints,
          rewardAmount: tier.reward,
          currentPoints: weeklyPoints
        };
        return;
      }
    }

    // Max tier reached
    this.rewardProgress = null;
  }
  
  loadTasks(): void {
    this.taskService.getTasks().subscribe({
      next: (response) => {
        this.tasks = response.tasks;
        this.stats.pendingTasks = this.tasks.filter(t => t.status === 'pending').length;
        this.stats.completedTasks = this.tasks.filter(t => t.status === 'completed').length;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading tasks:', error);
        this.isLoading = false;
      }
    });
  }
  loadHouseholdData(householdId: string): void {
    this.householdService.getHousehold(householdId).subscribe({
      next: (response) => {
        this.household = response.household;
        
        // Safely build leaderboard
        if (this.household && this.household.members && Array.isArray(this.household.members)) {
          this.leaderboard = this.household.members
            .map(member => member.user)
            .filter(user => user != null) // Filter out null/undefined users
            .sort((a, b) => (b.points || 0) - (a.points || 0));
          
          this.householdMembers = this.household.members
            .map(m => m.user)
            .filter(user => user != null); // Filter out null/undefined users
        } else {
          this.leaderboard = [];
          this.householdMembers = [];
        }
      },
      error: (error) => {
        console.error('Error loading household:', error);
        // Don't fail - just set empty arrays
        this.leaderboard = [];
        this.householdMembers = [];
      }
    });
  }
  openCreateTaskDialog(): void {
    this.showCreateTask = true;
    this.editingTask = null;
    this.resetNewTask();
  }

  closeCreateTaskDialog(): void {
    this.showCreateTask = false;
    this.editingTask = null;
    this.resetNewTask();
  }

  resetNewTask(): void {
    this.newTask = {
      title: '',
      description: '',
      priority: 'medium',
      category: 'other',
      assignedTo: '',
      dueDate: ''
    };
  }

  createTask(): void {
    if (!this.newTask.title) {
      alert('Please enter a task title');
      return;
    }

    const taskData: any = {
      title: this.newTask.title,
      description: this.newTask.description,
      priority: this.newTask.priority,
      category: this.newTask.category
    };

    if (this.newTask.dueDate) {
      taskData.dueDate = this.newTask.dueDate;
    }

    if (this.newTask.assignedTo) {
      taskData.assignedTo = this.newTask.assignedTo;
    }

    this.taskService.createTask(taskData).subscribe({
      next: (response) => {
        this.loadTasks();
        this.closeCreateTaskDialog();
      },
      error: (error) => {
        console.error('Error creating task:', error);
        alert('Failed to create task. Please try again.');
      }
    });
  }

  openEditTaskDialog(task: Task): void {
    this.editingTask = task;
    this.showCreateTask = true;
    this.newTask = {
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      category: task.category,
      assignedTo: task.assignedTo?.id || task.assignedTo as any || '',
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''
    };
  }

  updateTask(): void {
    if (!this.editingTask || !this.newTask.title) {
      return;
    }

    const taskData: any = {
      title: this.newTask.title,
      description: this.newTask.description,
      priority: this.newTask.priority,
      category: this.newTask.category
    };

    if (this.newTask.dueDate) {
      taskData.dueDate = this.newTask.dueDate;
    }

    if (this.newTask.assignedTo) {
      taskData.assignedTo = this.newTask.assignedTo;
    }

    this.taskService.updateTask(this.editingTask._id, taskData).subscribe({
      next: (response) => {
        this.loadTasks();
        this.closeCreateTaskDialog();
      },
      error: (error) => {
        console.error('Error updating task:', error);
        alert('Failed to update task. Please try again.');
      }
    });
  }

  deleteTask(taskId: string): void {
    if (confirm('Are you sure you want to delete this task?')) {
      this.taskService.deleteTask(taskId).subscribe({
        next: (response) => {
          this.loadTasks();
        },
        error: (error) => {
          console.error('Error deleting task:', error);
          alert('Failed to delete task. Please try again.');
        }
      });
    }
  }
 isHouseholdAdmin(): boolean {
    // Check user's role field directly
    if (this.currentUser && (this.currentUser as any).role === 'admin') {
      return true;
    }

    // Fallback: check if current user is the household creator
    if (!this.household || !this.currentUser) {
      return false;
    }
    
    // Safely get creator ID
    let creatorId: string | null = null;
    if (typeof this.household.creator === 'string') {
      creatorId = this.household.creator;
    } else if (this.household.creator && typeof this.household.creator === 'object') {
      creatorId = (this.household.creator as any)._id || (this.household.creator as any).id;
    }
    
    // Safely get current user ID
      let userId: string | null = null;
    if ((this.currentUser as any)._id) {
      userId = (this.currentUser as any)._id;
    } else if (this.currentUser.id) {
      userId = this.currentUser.id;
    }
    if (!creatorId || !userId) {
      return false;
    }
    
    return creatorId === userId;
  }

completeTask(taskId: string): void {
    this.taskService.completeTask(taskId).subscribe({
      next: (response) => {
        // Update stats
        if (response.newPoints) {
          this.stats.totalPoints = response.newPoints;
        }
        if (response.streakDays) {
          this.stats.streakDays = response.streakDays;
        }
        
        // Show badge notification if new badges earned
        if (response.newBadges && response.newBadges.length > 0) {
          this.showBadgeNotification(response.newBadges);
        }
        
        // Update reward progress
        if (response.nextReward) {
          this.rewardProgress = response.nextReward;
        }
        
        // Reload tasks
        this.loadTasks();
        
        // Reload user data
        this.authService.getMe().subscribe();
        
        // Reload leaderboard to show updated points
        if (this.currentUser?.household) {
          this.loadHouseholdData(this.currentUser.household);
        }
      },
      error: (error) => {
        console.error('Error completing task:', error);
      }
    });
  }
  getTasksByStatus(status: string): Task[] {
    return this.tasks.filter(t => t.status === status);
  }

  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'high': return '#f44336';
      case 'medium': return '#ff9800';
      case 'low': return '#4caf50';
      default: return '#9e9e9e';
    }
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'completed': return 'status-completed';
      case 'in-progress': return 'status-in-progress';
      case 'pending': return 'status-pending';
      default: return '';
    }
  }

  getMemberName(userId: string): string {
    const member = this.householdMembers.find(m => m.id === userId || (m as any)._id === userId);
    return member ? member.name : 'Unknown';
  }
canCompleteTask(task: Task): boolean {
    if (!this.currentUser || !task.assignedTo) {
      return false;
    }
    
    const assignedUserId = typeof task.assignedTo === 'string' 
      ? task.assignedTo 
      : (task.assignedTo as any)._id || (task.assignedTo as any).id;
    
    const currentUserId = (this.currentUser as any)._id || this.currentUser.id;
    
    return assignedUserId === currentUserId;
  }
   completedTasksExpanded = false;
  completedTasksSort: 'date' | 'person' = 'date';
  selectedPersonFilter: string = 'all';
  toggleCompletedTasks(): void {
    this.completedTasksExpanded = !this.completedTasksExpanded;
  }

  getSortedCompletedTasks(): Task[] {
    let tasks = this.getTasksByStatus('completed');
    
    // Filter by person
    if (this.selectedPersonFilter !== 'all') {
      tasks = tasks.filter(t => {
        const completedById = t.completedBy 
          ? ((t.completedBy as any)._id || (t.completedBy as any).id)
          : null;
        return completedById === this.selectedPersonFilter;
      });
    }
    
    // Sort
    if (this.completedTasksSort === 'date') {
      tasks.sort((a, b) => {
        const dateA = new Date(a.completedAt || 0).getTime();
        const dateB = new Date(b.completedAt || 0).getTime();
        return dateB - dateA; // Newest first
      });
    } else {
      tasks.sort((a, b) => {
        const nameA = (a.completedBy as any)?.name || '';
        const nameB = (b.completedBy as any)?.name || '';
        return nameA.localeCompare(nameB);
      });
    }
    
    return tasks;
  }
  // Announcement methods
  loadAnnouncements(): void {
    this.announcementService.getAnnouncements().subscribe({
      next: (response) => {
        this.announcements = response.announcements || [];
      },
      error: (error) => {
        console.error('Error loading announcements:', error);
      }
    });
  }

  openAnnouncementDialog(): void {
    this.showAnnouncementDialog = true;
    this.resetAnnouncement();
  }

  closeAnnouncementDialog(): void {
    this.showAnnouncementDialog = false;
    this.resetAnnouncement();
  }

  resetAnnouncement(): void {
    this.newAnnouncement = {
      title: '',
      message: '',
      type: 'info',
      expiresAt: ''
    };
  }

  createAnnouncement(): void {
    if (!this.newAnnouncement.title || !this.newAnnouncement.message) {
      alert('Please fill in all required fields');
      return;
    }

    const data: any = {
      title: this.newAnnouncement.title,
      message: this.newAnnouncement.message,
      type: this.newAnnouncement.type
    };

    if (this.newAnnouncement.expiresAt) {
      data.expiresAt = this.newAnnouncement.expiresAt;
    }

    this.announcementService.createAnnouncement(data).subscribe({
      next: (response) => {
        this.loadAnnouncements();
        this.closeAnnouncementDialog();
      },
      error: (error) => {
        console.error('Error creating announcement:', error);
        alert('Failed to create announcement');
      }
    });
  }

  deleteAnnouncement(id: string): void {
    if (confirm('Are you sure you want to delete this announcement?')) {
      this.announcementService.deleteAnnouncement(id).subscribe({
        next: () => {
          this.loadAnnouncements();
        },
        error: (error) => {
          console.error('Error deleting announcement:', error);
        }
      });
    }
  }

  getAnnouncementIcon(type: string): string {
    switch (type) {
      case 'important': return '⚠️';
      case 'celebration': return '🎉';
      case 'reminder': return '🔔';
      default: return 'ℹ️';
    }
  }

  getAnnouncementColor(type: string): string {
    switch (type) {
      case 'important': return '#f44336';
      case 'celebration': return '#4caf50';
      case 'reminder': return '#ff9800';
      default: return '#2196f3';
    }
  }

  showBadgeNotification(badges: any[]): void {
    const badgeNames = badges.map(b => `${b.icon} ${b.name}`).join(', ');
    alert(`🎉 Congratulations! You earned new badges:\n\n${badgeNames}`);
  }
}