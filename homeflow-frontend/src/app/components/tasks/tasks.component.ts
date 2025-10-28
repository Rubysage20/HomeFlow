import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TaskService } from '../../services/task.service';
import { AuthService } from '../../services/auth.service';
import { Task } from '../../models/models';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.css']
})
export class TasksComponent implements OnInit {
  tasks: Task[] = [];
  loading = true;
  filter = 'all';

  constructor(
    private taskService: TaskService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.loading = true;
    let filters: any = {};
    
    if (this.filter === 'my') {
      filters.assignedTo = this.authService.currentUserValue?._id;
    } else if (this.filter === 'open') {
      filters.status = 'open';
    }

    this.taskService.getTasks(filters).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.tasks = response.data;
        }
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  setFilter(filter: string): void {
    this.filter = filter;
    this.loadTasks();
  }

  navigateToTask(id: string): void {
    this.router.navigate(['/tasks', id]);
  }

  navigateToAddTask(): void {
    this.router.navigate(['/tasks/add']);
  }

  getPriorityClass(priority: string): string {
    return `badge-${priority}`;
  }

  getStatusClass(status: string): string {
    return `badge-${status}`;
  }
}
