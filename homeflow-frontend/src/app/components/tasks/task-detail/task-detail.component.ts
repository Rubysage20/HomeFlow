import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TaskService } from '../../../services/task.service';
import { Task } from '../../../models/models';

@Component({
  selector: 'app-task-detail',
  templateUrl: './task-detail.component.html',
  styleUrls: ['./task-detail.component.css']
})
export class TaskDetailComponent implements OnInit {
  task: Task | null = null;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private taskService: TaskService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.loadTask(id);
  }

  loadTask(id: string): void {
    this.taskService.getTask(id).subscribe({
      next: (response) => {
        this.task = response.data || null;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Task not found', 'Close', { duration: 3000 });
        this.router.navigate(['/tasks']);
      }
    });
  }

  completeTask(): void {
    if (!this.task) return;
    this.taskService.completeTask(this.task._id).subscribe({
      next: () => {
        this.snackBar.open(`Task completed! You earned ${this.task?.points} points! 🎉`, 'Close', { duration: 3000 });
        this.router.navigate(['/tasks']);
      },
      error: () => this.snackBar.open('Failed to complete task', 'Close', { duration: 3000 })
    });
  }

  deleteTask(): void {
    if (!this.task) return;
    this.taskService.deleteTask(this.task._id).subscribe({
      next: () => {
        this.snackBar.open('Task deleted', 'Close', { duration: 3000 });
        this.router.navigate(['/tasks']);
      },
      error: () => this.snackBar.open('Failed to delete task', 'Close', { duration: 3000 })
    });
  }
}
