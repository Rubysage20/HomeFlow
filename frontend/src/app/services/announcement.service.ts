import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Announcement {
  _id: string;
  title: string;
  message: string;
  type: 'info' | 'important' | 'celebration' | 'reminder';
  createdBy: { name: string };
  createdAt: Date;
  expiresAt?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class AnnouncementService {
  private apiUrl = `${environment.apiUrl}/announcements`;

  constructor(private http: HttpClient) {}

  getAnnouncements(): Observable<any> {
    return this.http.get(`${this.apiUrl}`);
  }

  createAnnouncement(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}`, data);
  }

  deleteAnnouncement(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}