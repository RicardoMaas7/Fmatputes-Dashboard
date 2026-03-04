import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Reminder } from '../../models';

@Component({
  selector: 'app-reminders-banner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="reminders.length > 0" class="reminders-wrapper animate-fade-in">
      <div *ngFor="let r of visibleReminders" class="reminder-item" [ngClass]="'type-' + r.type">
        <div class="reminder-icon" [innerHTML]="getIcon(r.type)"></div>
        <div class="reminder-body">
          <h4 class="reminder-title">{{ r.title }}</h4>
          <p *ngIf="r.message" class="reminder-msg">{{ r.message }}</p>
          <span *ngIf="r.expires_at || r.expiresAt" class="reminder-expires">
            Expira: {{ formatDate((r.expires_at || r.expiresAt) ?? '') }}
          </span>
        </div>
      </div>
      <button *ngIf="reminders.length > 3" (click)="expanded = !expanded" class="toggle-btn">
        {{ expanded ? '▲ Ver menos' : '▼ Ver ' + (reminders.length - 3) + ' más' }}
      </button>
    </div>
  `,
  styles: [`
    .reminders-wrapper {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .reminder-item {
      display: flex;
      align-items: flex-start;
      gap: 0.6rem;
      padding: 0.65rem 0.85rem;
      border-radius: 8px;
      backdrop-filter: blur(6px);
      border: 1px solid;
      transition: opacity 0.2s;
    }
    .reminder-item.type-info {
      background: rgba(57, 255, 20, 0.04);
      border-color: rgba(57, 255, 20, 0.12);
    }
    .reminder-item.type-warning {
      background: rgba(255, 191, 0, 0.04);
      border-color: rgba(255, 191, 0, 0.15);
    }
    .reminder-item.type-urgent {
      background: rgba(255, 60, 60, 0.04);
      border-color: rgba(255, 60, 60, 0.15);
    }
    .reminder-icon {
      flex-shrink: 0;
      margin-top: 2px;
    }
    .reminder-body {
      flex: 1;
      min-width: 0;
    }
    .reminder-title {
      font-family: 'Inter', sans-serif;
      font-size: 12px;
      font-weight: 600;
      color: white;
      margin: 0;
    }
    .type-warning .reminder-title { color: #ffbf00; }
    .type-urgent .reminder-title { color: #ff5555; }
    .reminder-msg {
      font-family: 'Inter', sans-serif;
      font-size: 11px;
      color: rgba(255, 255, 255, 0.55);
      margin: 2px 0 0;
      line-height: 1.4;
    }
    .reminder-expires {
      font-family: 'JetBrains Mono', monospace;
      font-size: 9px;
      color: rgba(255, 255, 255, 0.25);
      margin-top: 4px;
      display: block;
    }
    .toggle-btn {
      background: none;
      border: 1px solid rgba(57, 255, 20, 0.1);
      color: rgba(57, 255, 20, 0.45);
      font-family: 'Inter', sans-serif;
      font-size: 10px;
      padding: 0.35rem 0.75rem;
      border-radius: 6px;
      cursor: pointer;
      text-align: center;
      transition: all 0.15s;
      width: 100%;
    }
    .toggle-btn:hover {
      color: #39ff14;
      border-color: rgba(57, 255, 20, 0.25);
      background: rgba(57, 255, 20, 0.04);
    }
  `],
})
export class RemindersBannerComponent {
  @Input() reminders: Reminder[] = [];
  expanded = false;

  get visibleReminders(): Reminder[] {
    return this.expanded ? this.reminders : this.reminders.slice(0, 3);
  }

  constructor(private sanitizer: DomSanitizer) {}

  getIcon(type: string): SafeHtml {
    const icons: Record<string, string> = {
      info: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#39ff14" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
      warning: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffbf00" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
      urgent: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ff5555" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
    };
    return this.sanitizer.bypassSecurityTrustHtml(icons[type] || icons['info']);
  }

  formatDate(date: string): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
  }
}
