import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Task, TaskCompletionResponse } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private apiUrl = `${environment.apiUrl}/tasks`;

  constructor(private http: HttpClient) {}

  getTasks(status?: string): Observable<{ success: boolean; count: number; tasks: Task[] }> {
    const url = status ? `${this.apiUrl}?status=${status}` : this.apiUrl;
    return this.http.get<{ success: boolean; count: number; tasks: Task[] }>(url);
  }

  createTask(taskData: Partial<Task>): Observable<{ success: boolean; task: Task }> {
    return this.http.post<{ success: boolean; task: Task }>(this.apiUrl, taskData);
  }

  updateTask(id: string, taskData: Partial<Task>): Observable<{ success: boolean; task: Task }> {
    return this.http.put<{ success: boolean; task: Task }>(`${this.apiUrl}/${id}`, taskData);
  }

  completeTask(id: string): Observable<TaskCompletionResponse> {
    return this.http.put<TaskCompletionResponse>(`${this.apiUrl}/${id}/complete`, {});
  }

  deleteTask(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${id}`);
  }
}