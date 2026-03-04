import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  User, BankAccount, SharedService, Transport, Treasury,
  AppNotification, Reminder, VoteResult, RadarResponse
} from '../models';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /** Get all users (public list) */
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users`);
  }

  /** Get a single user by ID */
  getUser(userId: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/users/${userId}`);
  }

  /** Get current user with all related data */
  getMe(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/users/me`);
  }

  /** Get all services with user debts */
  getServices(): Observable<SharedService[]> {
    return this.http.get<SharedService[]>(`${this.apiUrl}/services`);
  }

  /** Get all transports with seats */
  getTransports(): Observable<Transport[]> {
    return this.http.get<Transport[]>(`${this.apiUrl}/transport`);
  }

  /** Get treasury info */
  getTreasury(): Observable<Treasury> {
    return this.http.get<Treasury>(`${this.apiUrl}/treasury`);
  }

  /** Get user notifications */
  getNotifications(): Observable<AppNotification[]> {
    return this.http.get<AppNotification[]>(`${this.apiUrl}/notifications`);
  }

  /** Get radar chart SVG for a user */
  getRadarSvg(userId: string, period?: string): Observable<RadarResponse> {
    const params = period ? `?period=${period}` : '';
    return this.http.get<RadarResponse>(`${this.apiUrl}/votes/results/${userId}/radar${params}`);
  }

  /** Get vote results for a user */
  getVoteResults(userId: string, period?: string): Observable<VoteResult> {
    const params = period ? `?period=${period}` : '';
    return this.http.get<VoteResult>(`${this.apiUrl}/votes/results/${userId}${params}`);
  }

  /** Reserve a transport seat */
  reserveSeat(transportId: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/transport/${transportId}/reserve`, {});
  }

  /** Cancel transport seat reservation */
  cancelSeat(transportId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/transport/${transportId}/cancel`);
  }

  /* ─── Bank Accounts ─── */
  getBankAccounts(): Observable<BankAccount[]> {
    return this.http.get<BankAccount[]>(`${this.apiUrl}/bank-accounts`);
  }

  createBankAccount(data: Partial<BankAccount>): Observable<BankAccount> {
    return this.http.post<BankAccount>(`${this.apiUrl}/bank-accounts`, data);
  }

  updateBankAccount(id: string, data: Partial<BankAccount>): Observable<BankAccount> {
    return this.http.put<BankAccount>(`${this.apiUrl}/bank-accounts/${id}`, data);
  }

  deleteBankAccount(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/bank-accounts/${id}`);
  }

  /** Mark a notification as read */
  markNotificationRead(id: string): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.apiUrl}/notifications/${id}/read`, {});
  }

  /** Mark all notifications as read */
  markAllNotificationsRead(): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.apiUrl}/notifications/read-all`, {});
  }

  /** Change password */
  changePassword(currentPassword: string, newPassword: string): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.apiUrl}/auth/change-password`, { currentPassword, newPassword });
  }

  /* ─── Reminders ─── */
  getReminders(): Observable<Reminder[]> {
    return this.http.get<Reminder[]>(`${this.apiUrl}/reminders`);
  }

  getAllReminders(): Observable<Reminder[]> {
    return this.http.get<Reminder[]>(`${this.apiUrl}/reminders/all`);
  }

  createReminder(data: { title: string; message?: string; type?: string; expiresAt?: string }): Observable<Reminder> {
    return this.http.post<Reminder>(`${this.apiUrl}/reminders`, data);
  }

  deleteReminder(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/reminders/${id}`);
  }

  toggleReminder(id: string): Observable<Reminder> {
    return this.http.put<Reminder>(`${this.apiUrl}/reminders/${id}/toggle`, {});
  }

  /* ─── Transport CRUD ─── */
  createTransport(data: Partial<Transport>): Observable<Transport> {
    return this.http.post<Transport>(`${this.apiUrl}/transport`, data);
  }

  updateTransport(id: string, data: Partial<Transport>): Observable<Transport> {
    return this.http.put<Transport>(`${this.apiUrl}/transport/${id}`, data);
  }

  deleteTransport(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/transport/${id}`);
  }

  updateTransportPriority(id: string, seatIds: string[]): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.apiUrl}/transport/${id}/priority`, { seatIds });
  }
}
