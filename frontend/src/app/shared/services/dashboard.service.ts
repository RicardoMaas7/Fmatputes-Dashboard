import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /** Get all users (public list) */
  getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/users`);
  }

  /** Get a single user by ID */
  getUser(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/users/${userId}`);
  }

  /** Get current user with all related data */
  getMe(): Observable<any> {
    return this.http.get(`${this.apiUrl}/users/me`);
  }

  /** Get all services with user debts */
  getServices(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/services`);
  }

  /** Get all transports with seats */
  getTransports(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/transport`);
  }

  /** Get treasury info */
  getTreasury(): Observable<any> {
    return this.http.get(`${this.apiUrl}/treasury`);
  }

  /** Get user notifications */
  getNotifications(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/notifications`);
  }

  /** Get radar chart SVG for a user */
  getRadarSvg(userId: string, period?: string): Observable<any> {
    const params = period ? `?period=${period}` : '';
    return this.http.get(`${this.apiUrl}/votes/results/${userId}/radar${params}`);
  }

  /** Get vote results for a user */
  getVoteResults(userId: string, period?: string): Observable<any> {
    const params = period ? `?period=${period}` : '';
    return this.http.get(`${this.apiUrl}/votes/results/${userId}${params}`);
  }

  /** Reserve a transport seat */
  reserveSeat(transportId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/transport/${transportId}/reserve`, {});
  }

  /** Cancel transport seat reservation */
  cancelSeat(transportId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/transport/${transportId}/cancel`);
  }

  /* ─── Bank Accounts ─── */
  getBankAccounts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/bank-accounts`);
  }

  createBankAccount(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/bank-accounts`, data);
  }

  updateBankAccount(id: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/bank-accounts/${id}`, data);
  }

  deleteBankAccount(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/bank-accounts/${id}`);
  }

  /** Mark a notification as read */
  markNotificationRead(id: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/notifications/${id}/read`, {});
  }

  /** Change password */
  changePassword(currentPassword: string, newPassword: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/auth/change-password`, { currentPassword, newPassword });
  }

  /* ─── Reminders ─── */
  getReminders(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/reminders`);
  }
}
