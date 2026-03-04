import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface VotePayload {
  voteeId: string;
  category: string;
  score: number;
}

export interface VoteStatus {
  period: string;
  totalUsers: number;
  completedUsers: number;
  locked: boolean;
  message: string;
}

export interface PendingUser {
  id: string;
  username: string;
  displayName: string;
  profilePhotoUrl: string;
  votedCategories: string[];
  missingCategories: string[];
  isComplete: boolean;
  locked: boolean;
}

export interface PendingResponse {
  period: string;
  totalUsers: number;
  completedUsers: number;
  allLocked: boolean;
  pending: PendingUser[];
}

@Injectable({
  providedIn: 'root',
})
export class VoteService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /** Submit votes (final — cannot be changed) */
  submitVotes(votes: VotePayload[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/votes`, { votes });
  }

  /** Get pending votes for current user */
  getPending(): Observable<PendingResponse> {
    return this.http.get<PendingResponse>(`${this.apiUrl}/votes/pending`);
  }

  /** Get vote lock status for current semester */
  getVoteStatus(): Observable<VoteStatus> {
    return this.http.get<VoteStatus>(`${this.apiUrl}/votes/status`);
  }

  /** Get all users */
  getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/users`);
  }
}
