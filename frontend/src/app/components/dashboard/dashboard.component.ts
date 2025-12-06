import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '../../services/auth.service';
import { TaskService } from '../../services/task.service';
import { HouseholdService } from '../../services/household.service';
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
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadUserData();
  }

  loadUserData(): void {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.currentUser = user;
        this.stats.totalPoints = user.points;
        this.stats.streakDays = user.streakDays;
        
        if (user.household) {
          this.loadHouseholdData(user.household);
        }
        
        this.loadTasks();
      }
    });
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
        this.householdMembers = response.household.members.map(m => m.user);
      },
      error: (error) => {
        console.error('Error loading household:', error);
      }
    });

    this.householdService.getLeaderboard(householdId).subscribe({
      next: (response) => {
        this.leaderboard = response.leaderboard.slice(0, 5);
      },
      error: (error) => {
        console.error('Error loading leaderboard:', error);
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
    if (!this.household || !this.currentUser) {
      return false;
    }
    
    // Check if current user is the household creator
    const creatorId = typeof this.household.creator === 'string' 
      ? this.household.creator 
      : this.household.creator._id || this.household.creator.id;
    
    const userId = this.currentUser._id || this.currentUser.id;
    
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
}