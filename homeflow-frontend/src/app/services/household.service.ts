import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse, Household, HouseholdStats } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class HouseholdService {
  private apiUrl = `${environment.apiUrl}/households`;

  constructor(private http: HttpClient) {}

  getHouseholds(): Observable<ApiResponse<Household[]>> {
    return this.http.get<ApiResponse<Household[]>>(this.apiUrl);
  }

  getHousehold(id: string): Observable<ApiResponse<Household>> {
    return this.http.get<ApiResponse<Household>>(`${this.apiUrl}/${id}`);
  }

  createHousehold(data: { name: string; description?: string }): Observable<ApiResponse<Household>> {
    return this.http.post<ApiResponse<Household>>(this.apiUrl, data);
  }

  updateHousehold(id: string, data: Partial<Household>): Observable<ApiResponse<Household>> {
    return this.http.put<ApiResponse<Household>>(`${this.apiUrl}/${id}`, data);
  }

  deleteHousehold(id: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${id}`);
  }

  joinHousehold(inviteCode: string): Observable<ApiResponse<Household>> {
    return this.http.post<ApiResponse<Household>>(`${this.apiUrl}/join`, { inviteCode });
  }

  leaveHousehold(id: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/${id}/leave`, {});
  }

  removeMember(householdId: string, userId: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${householdId}/members/${userId}`);
  }

  getHouseholdStats(id: string): Observable<ApiResponse<HouseholdStats>> {
    return this.http.get<ApiResponse<HouseholdStats>>(`${this.apiUrl}/${id}/stats`);
  }
}
