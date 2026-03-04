import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /* ─── Users ─── */
  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/users`);
  }

  createUser(data: { username: string; password: string; displayName?: string; birthday?: string; role?: string }): Observable<any> {
    return this.http.post(`${this.api}/users`, data);
  }

  updateUser(id: string, data: any): Observable<any> {
    return this.http.put(`${this.api}/users/${id}`, data);
  }

  deleteUser(id: string): Observable<any> {
    return this.http.delete(`${this.api}/users/${id}`);
  }

  /* ─── Services ─── */
  getServices(): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/services`);
  }

  createService(data: { name: string; totalCost: number; nextPaymentDate?: string; iconUrl?: string }): Observable<any> {
    return this.http.post(`${this.api}/services`, data);
  }

  updateService(id: string, data: any): Observable<any> {
    return this.http.put(`${this.api}/services/${id}`, data);
  }

  deleteService(id: string): Observable<any> {
    return this.http.delete(`${this.api}/services/${id}`);
  }

  getServiceDebts(serviceId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/services/${serviceId}/debts`);
  }

  updateServiceDebt(serviceId: string, userId: string, data: any): Observable<any> {
    return this.http.put(`${this.api}/services/${serviceId}/debts/${userId}`, data);
  }

  /* ─── Transport ─── */
  getTransports(): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/transport`);
  }

  createTransport(data: any): Observable<any> {
    return this.http.post(`${this.api}/transport`, data);
  }

  updateTransport(id: string, data: any): Observable<any> {
    return this.http.put(`${this.api}/transport/${id}`, data);
  }

  /* ─── Treasury ─── */
  getTreasury(): Observable<any> {
    return this.http.get(`${this.api}/treasury`);
  }

  registerPayment(data: { userId: string; amountPaid: number }): Observable<any> {
    return this.http.post(`${this.api}/treasury/payment`, data);
  }

  updateTreasury(data: { name?: string; nextGoalAmount?: number; nextGoalDescription?: string }): Observable<any> {
    return this.http.put(`${this.api}/treasury`, data);
  }

  /* ─── Reminders ─── */
  getReminders(): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/reminders/all`);
  }

  createReminder(data: { title: string; message?: string; type?: string; expiresAt?: string }): Observable<any> {
    return this.http.post(`${this.api}/reminders`, data);
  }

  toggleReminder(id: string): Observable<any> {
    return this.http.put(`${this.api}/reminders/${id}/toggle`, {});
  }

  deleteReminder(id: string): Observable<any> {
    return this.http.delete(`${this.api}/reminders/${id}`);
  }
}
