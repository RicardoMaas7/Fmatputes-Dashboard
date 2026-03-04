import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface VoteCategory {
  key: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-vote-member-card',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './vote-member-card.component.html',
  styleUrls: ['./vote-member-card.component.css'],
})
export class VoteMemberCardComponent {
  @Input() user!: any;
  @Input() categories: VoteCategory[] = [];
  @Input() scores: { [category: string]: number } = {};
  @Input() expanded = false;
  @Input() submitting = false;
  @Input() animationDelay = '0ms';

  @Output() toggle = new EventEmitter<string>();
  @Output() scoreChange = new EventEmitter<{ category: string; score: number }>();
  @Output() submitVotes = new EventEmitter<string>();

  get displayName(): string {
    return this.user?.displayName || this.user?.username || '';
  }

  get initial(): string {
    return this.displayName.charAt(0).toUpperCase();
  }

  get isComplete(): boolean {
    return this.user?.isComplete ?? false;
  }

  get isLocked(): boolean {
    return this.user?.locked ?? false;
  }

  getScore(category: string): number {
    return this.scores[category] ?? 5;
  }

  isAlreadyVoted(category: string): boolean {
    return (this.user?.votedCategories || []).includes(category);
  }

  onToggle(): void {
    this.toggle.emit(this.user.id);
  }

  onScoreChange(category: string, value: number): void {
    this.scoreChange.emit({ category, score: value });
  }

  onSubmit(): void {
    this.submitVotes.emit(this.user.id);
  }
}
