import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TaskService } from '../../../services/task.service';

@Component({
  selector: 'app-add-task',
  templateUrl: './add-task.component.html',
  styleUrls: ['./add-task.component.css']
})
export class AddTaskComponent implements OnInit {
  taskForm!: FormGroup;
  loading = false;

  constructor(private fb: FormBuilder, private taskService: TaskService, private router: Router, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.taskForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      estimatedMinutes: [30, [Validators.required, Validators.min(1)]],
      priority: ['medium', Validators.required],
      dueDate: [new Date(), Validators.required],
      tags: ['']
    });
  }

  onSubmit(): void {
    if (this.taskForm.invalid) return;
    this.loading = true;
    const formValue = this.taskForm.value;
    const taskData = { ...formValue, tags: formValue.tags ? formValue.tags.split(',').map((t: string) => t.trim()) : [] };
    this.taskService.createTask(taskData).subscribe({
      next: () => {
        this.snackBar.open('Task created!', 'Close', { duration: 3000 });
        this.router.navigate(['/tasks']);
      },
      error: () => { this.loading = false; this.snackBar.open('Failed to create task', 'Close', { duration: 3000 }); }
    });
  }
}
