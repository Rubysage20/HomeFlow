import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '../../services/auth.service';
import { TaskService } from '../../services/task.service';
import { HouseholdService } from '../../services/household.service';
import { Task, HouseholdStats, Household } from '../../models/models';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  loading = true;
  household: Household | null = null;
  stats: HouseholdStats | null = null;
  myTasks: Task[] = [];
  autoAssigning = false;

  constructor(
    public authService: AuthService,
    private taskService: TaskService,
    private householdService: HouseholdService,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  get currentUser() {
    return this.authService.currentUserValue;
  }

  get hasHousehold(): boolean {
    return !!this.currentUser?.household;
  }

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  loadDashboardData(): void {
    if (!this.hasHousehold) {
      this.loading = false;
      return;
    }

    const householdId = this.currentUser!.household!;

    // Load household details
    this.householdService.getHousehold(householdId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.household = response.data;
        }
      },
      error: (error) => console.error('Error loading household:', error)
    });

    // Load household stats
    this.householdService.getHouseholdStats(householdId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.stats = response.data;
        }
      },
      error: (error) => console.error('Error loading stats:', error)
    });

    // Load my tasks
    this.taskService.getTasks({
      assignedTo: this.currentUser!._id,
      status: 'assigned'
    }).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.myTasks = response.data.slice(0, 5); // Show top 5
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading tasks:', error);
        this.loading = false;
      }
    });
  }

  onAutoAssign(): void {
    if (!this.isAdmin) {
      this.snackBar.open('Only admins can auto-assign tasks', 'Close', { duration: 3000 });
      return;
    }

    this.autoAssigning = true;
    this.taskService.autoAssignTasks().subscribe({
      next: (result) => {
        this.autoAssigning = false;
        if (result.success) {
          this.snackBar.open(
            `✨ ${result.message}! ${result.assignments.length} tasks assigned.`,
            'Close',
            { duration: 5000 }
          );
          this.loadDashboardData(); // Reload data
        }
      },
      error: (error) => {
        this.autoAssigning = false;
        const message = error.error?.message || 'Failed to auto-assign tasks';
        this.snackBar.open(message, 'Close', { duration: 5000 });
      }
    });
  }

  navigateToAddTask(): void {
    this.router.navigate(['/tasks/add']);
  }

  navigateToTasks(): void {
    this.router.navigate(['/tasks']);
  }

  navigateToHousehold(): void {
    this.router.navigate(['/household']);
  }

  navigateToTaskDetail(taskId: string): void {
    this.router.navigate(['/tasks', taskId]);
  }

  getPriorityClass(priority: string): string {
    return `badge-${priority}`;
  }

  refresh(): void {
    this.loading = true;
    this.loadDashboardData();
  }
}
