import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VoteService, VotePayload, PendingUser, PendingResponse } from '../../shared/services/vote.service';
import { VoteProgressComponent } from './components/vote-progress/vote-progress.component';
import { VoteMemberCardComponent } from './components/vote-member-card/vote-member-card.component';

interface UserVotes {
  [category: string]: number;
}

@Component({
  selector: 'app-voting',
  standalone: true,
  imports: [CommonModule, VoteProgressComponent, VoteMemberCardComponent],
  templateUrl: './voting.component.html',
  styleUrls: ['./voting.component.css'],
})
export class VotingComponent implements OnInit {
  loading = true;
  submitting = false;
  period = '';
  totalUsers = 0;
  completedUsers = 0;
  allLocked = false;
  pendingUsers: PendingUser[] = [];
  expandedUserId: string | null = null;

  categories = [
    { key: 'mathematics', label: 'Matemáticas', icon: 'M' },
    { key: 'programming', label: 'Programación', icon: '</>' },
    { key: 'teamwork', label: 'Trabajo en Equipo', icon: 'T' },
    { key: 'discipline', label: 'Disciplina', icon: 'D' },
    { key: 'sociability', label: 'Sociabilidad', icon: 'S' },
  ];

  // Store votes per user: { [userId]: { [category]: score } }
  votes: { [userId: string]: UserVotes } = {};

  submitSuccess: string | null = null;
  submitError: string | null = null;

  get hasPending(): boolean {
    return this.pendingUsers.some((u) => !u.isComplete);
  }

  constructor(private voteService: VoteService) {}

  ngOnInit(): void {
    this.loadPending();
  }

  loadPending(): void {
    this.loading = true;
    this.voteService.getPending().subscribe({
      next: (data: PendingResponse) => {
        this.period = data.period;
        this.totalUsers = data.totalUsers;
        this.completedUsers = data.completedUsers;
        this.allLocked = data.allLocked;
        this.pendingUsers = data.pending;

        // Initialize votes map for incomplete (non-locked) users
        this.pendingUsers.forEach((user) => {
          if (!user.locked && !this.votes[user.id]) {
            this.votes[user.id] = {};
            this.categories.forEach((cat) => {
              this.votes[user.id][cat.key] = 5;
            });
          }
        });

        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  toggleUser(userId: string): void {
    this.expandedUserId = this.expandedUserId === userId ? null : userId;
  }

  isExpanded(userId: string): boolean {
    return this.expandedUserId === userId;
  }

  getUserScores(userId: string): { [category: string]: number } {
    return this.votes[userId] || {};
  }

  onScoreChange(userId: string, event: { category: string; score: number }): void {
    if (!this.votes[userId]) this.votes[userId] = {};
    this.votes[userId][event.category] = event.score;
  }

  submitVotesFor(userId: string): void {
    const user = this.pendingUsers.find(u => u.id === userId);
    if (!user || user.locked) return;

    this.submitting = true;
    this.submitSuccess = null;
    this.submitError = null;

    const userVotes = this.votes[user.id] || {};
    const payload: VotePayload[] = this.categories.map((cat) => ({
      voteeId: user.id,
      category: cat.key,
      score: userVotes[cat.key] || 5,
    }));

    this.voteService.submitVotes(payload).subscribe({
      next: () => {
        this.submitting = false;
        this.submitSuccess = `Votos para ${user.displayName || user.username} enviados correctamente. Son definitivos.`;
        this.loadPending();
        setTimeout(() => (this.submitSuccess = null), 4000);
      },
      error: (err) => {
        this.submitting = false;
        this.submitError = err.error?.message || 'Error al enviar votos.';
        setTimeout(() => (this.submitError = null), 4000);
      },
    });
  }

  submitAllVotes(): void {
    this.submitting = true;
    this.submitSuccess = null;
    this.submitError = null;

    const allPayload: VotePayload[] = [];

    this.pendingUsers
      .filter((u) => !u.isComplete && !u.locked)
      .forEach((user) => {
        this.categories.forEach((cat) => {
          allPayload.push({
            voteeId: user.id,
            category: cat.key,
            score: this.votes[user.id]?.[cat.key] || 5,
          });
        });
      });

    if (allPayload.length === 0) {
      this.submitSuccess = 'Ya has votado a todos los miembros este semestre.';
      this.submitting = false;
      return;
    }

    this.voteService.submitVotes(allPayload).subscribe({
      next: () => {
        this.submitting = false;
        this.submitSuccess = `${allPayload.length} votos enviados correctamente. Son definitivos.`;
        this.loadPending();
        setTimeout(() => (this.submitSuccess = null), 4000);
      },
      error: (err) => {
        this.submitting = false;
        this.submitError = err.error?.message || 'Error al enviar votos.';
        setTimeout(() => (this.submitError = null), 4000);
      },
    });
  }
}
