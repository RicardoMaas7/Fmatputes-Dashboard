import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  User, SharedService, UserServiceDebt, Transport, Treasury, Reminder
} from '../models';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /* ─── Users ─── */
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.api}/users`);
  }

  createUser(data: { username: string; password: string; displayName?: string; birthday?: string; role?: string }): Observable<User> {
    return this.http.post<User>(`${this.api}/users`, data);
  }

  updateUser(id: string, data: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.api}/users/${id}`, data);
  }

  deleteUser(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.api}/users/${id}`);
  }

  resetPassword(userId: string, newPassword: string): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.api}/auth/reset-password/${userId}`, { newPassword });
  }

  /* ─── Services ─── */
  getServices(): Observable<SharedService[]> {
    return this.http.get<SharedService[]>(`${this.api}/services`);
  }

  createService(data: { name: string; totalCost: number; nextPaymentDate?: string; iconUrl?: string }): Observable<SharedService> {
    return this.http.post<SharedService>(`${this.api}/services`, data);
  }

  updateService(id: string, data: Partial<SharedService>): Observable<SharedService> {
    return this.http.put<SharedService>(`${this.api}/services/${id}`, data);
  }

  deleteService(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.api}/services/${id}`);
  }

  getServiceDebts(serviceId: string): Observable<UserServiceDebt[]> {
    return this.http.get<UserServiceDebt[]>(`${this.api}/services/${serviceId}/debts`);
  }

  updateServiceDebt(serviceId: string, userId: string, data: Partial<UserServiceDebt>): Observable<UserServiceDebt> {
    return this.http.put<UserServiceDebt>(`${this.api}/services/${serviceId}/debts/${userId}`, data);
  }

  /* ─── Transport ─── */
  getTransports(): Observable<Transport[]> {
    return this.http.get<Transport[]>(`${this.api}/transport`);
  }

  createTransport(data: Partial<Transport>): Observable<Transport> {
    return this.http.post<Transport>(`${this.api}/transport`, data);
  }

  updateTransport(id: string, data: Partial<Transport>): Observable<Transport> {
    return this.http.put<Transport>(`${this.api}/transport/${id}`, data);
  }

  /* ─── Treasury ─── */
  getTreasury(): Observable<Treasury> {
    return this.http.get<Treasury>(`${this.api}/treasury`);
  }

  registerPayment(data: { userId: string; amountPaid: number }): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.api}/treasury/payment`, data);
  }

  updateTreasury(data: { name?: string; nextGoalAmount?: number; nextGoalDescription?: string }): Observable<Treasury> {
    return this.http.put<Treasury>(`${this.api}/treasury`, data);
  }

  /* ─── Reminders ─── */
  getReminders(): Observable<Reminder[]> {
    return this.http.get<Reminder[]>(`${this.api}/reminders/all`);
  }

  createReminder(data: { title: string; message?: string; type?: string; expiresAt?: string }): Observable<Reminder> {
    return this.http.post<Reminder>(`${this.api}/reminders`, data);
  }

  toggleReminder(id: string): Observable<Reminder> {
    return this.http.put<Reminder>(`${this.api}/reminders/${id}/toggle`, {});
  }

  deleteReminder(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.api}/reminders/${id}`);
  }
}
