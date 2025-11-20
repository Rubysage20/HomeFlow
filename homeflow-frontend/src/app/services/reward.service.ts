import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse, Reward, Badge, RewardStats, LeaderboardEntry } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class RewardService {
  private apiUrl = `${environment.apiUrl}/rewards`;

  constructor(private http: HttpClient) {}

  getUserRewards(): Observable<ApiResponse<Reward[]>> {
    return this.http.get<ApiResponse<Reward[]>>(this.apiUrl);
  }

  getAvailableBadges(): Observable<ApiResponse<Badge[]>> {
    return this.http.get<ApiResponse<Badge[]>>(`${this.apiUrl}/available`);
  }

  getLeaderboard(householdId?: string): Observable<ApiResponse<LeaderboardEntry[]>> {
    let params = new HttpParams();
    if (householdId) {
      params = params.set('household', householdId);
    }
    return this.http.get<ApiResponse<LeaderboardEntry[]>>(`${this.apiUrl}/leaderboard`, { params });
  }

  processRewards(): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/process`, {});
  }

  getRewardStats(): Observable<ApiResponse<RewardStats>> {
    return this.http.get<ApiResponse<RewardStats>>(`${this.apiUrl}/stats`);
  }
}
