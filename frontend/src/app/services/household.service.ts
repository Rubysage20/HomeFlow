import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Household, User } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class HouseholdService {
  private apiUrl = `${environment.apiUrl}/households`;

  constructor(private http: HttpClient) {}

  createHousehold(name: string): Observable<{ success: boolean; household: Household }> {
    return this.http.post<{ success: boolean; household: Household }>(this.apiUrl, { name });
  }

  getHousehold(id: string): Observable<{ success: boolean; household: Household }> {
    return this.http.get<{ success: boolean; household: Household }>(`${this.apiUrl}/${id}`);
  }

  joinHousehold(inviteCode: string): Observable<{ success: boolean; message: string; household: Household }> {
    return this.http.post<{ success: boolean; message: string; household: Household }>(`${this.apiUrl}/join`, { inviteCode });
  }

  getLeaderboard(id: string): Observable<{ success: boolean; leaderboard: User[] }> {
    return this.http.get<{ success: boolean; leaderboard: User[] }>(`${this.apiUrl}/${id}/leaderboard`);
  }
}