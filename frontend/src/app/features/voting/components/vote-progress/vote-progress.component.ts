import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-vote-progress',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="neon-card p-4 mb-6">
      <div class="flex items-center justify-between mb-2">
        <span class="text-xs text-wired-dim-light uppercase tracking-wider">
          Progreso de votación — Semestre {{ period }}
        </span>
        <span class="text-wired-neon text-sm font-bold">
          {{ completedUsers }}/{{ totalUsers }} completados
        </span>
      </div>
      <div class="progress-track">
        <div
          class="progress-fill"
          [style.width.%]="progress"
          [class.complete]="progress === 100"
        ></div>
      </div>
      <div class="text-right mt-1">
        <span class="text-xs" [class.text-wired-neon]="progress < 100" [class.text-wired-amber]="progress === 100">
          {{ progress }}%
        </span>
      </div>
    </div>
  `,
  styles: [`
    .progress-track {
      width: 100%;
      height: 8px;
      background: rgba(255,255,255,0.06);
      border-radius: 9999px;
      overflow: hidden;
    }
    .progress-fill {
      height: 100%;
      background: #39ff14;
      transition: width 0.5s ease;
      border-radius: 9999px;
    }
    .progress-fill.complete {
      background: #ffbf00;
    }
  `],
})
export class VoteProgressComponent {
  @Input() period = '';
  @Input() totalUsers = 0;
  @Input() completedUsers = 0;

  get progress(): number {
    if (this.totalUsers === 0) return 0;
    return Math.round((this.completedUsers / this.totalUsers) * 100);
  }
}
