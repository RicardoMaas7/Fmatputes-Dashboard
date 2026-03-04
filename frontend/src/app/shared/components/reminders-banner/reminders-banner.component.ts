import { Component, Input, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Reminder } from '../../models';

@Component({
  selector: 'app-reminders-banner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="activeReminders.length > 0" class="reminders-trigger-wrapper">
      <!-- Compact bar -->
      <button (click)="togglePanel()" class="trigger-bar" [class.open]="panelOpen">
        <span class="trigger-icon" [innerHTML]="bellIcon"></span>
        <span class="trigger-label">{{ activeReminders.length }} recordatorio{{ activeReminders.length > 1 ? 's' : '' }}</span>
        <span *ngIf="urgentCount > 0" class="urgent-badge">{{ urgentCount }}</span>
        <span class="trigger-arrow">{{ panelOpen ? '▲' : '▼' }}</span>
      </button>

      <!-- Dropdown panel -->
      <div *ngIf="panelOpen" class="reminders-panel animate-fade-in">
        <div class="panel-scroll">
          <div *ngFor="let r of activeReminders; let i = index"
               class="reminder-item" [ngClass]="'type-' + r.type">
            <div class="reminder-icon" [innerHTML]="getIcon(r.type)"></div>
            <div class="reminder-body">
              <h4 class="reminder-title">{{ r.title }}</h4>
              <p *ngIf="r.message" class="reminder-msg">{{ r.message }}</p>
              <span *ngIf="r.expires_at || r.expiresAt" class="reminder-expires">
                Expira: {{ formatDate((r.expires_at || r.expiresAt) ?? '') }}
              </span>
            </div>
            <button (click)="dismiss(i); $event.stopPropagation()" class="dismiss-btn" title="Ocultar">✕</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .reminders-trigger-wrapper {
      position: relative;
    }
    .trigger-bar {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      width: 100%;
      padding: 0.5rem 0.85rem;
      background: rgba(14, 14, 22, 0.65);
      border: 1px solid rgba(57, 255, 20, 0.1);
      border-radius: 8px;
      backdrop-filter: blur(6px);
      cursor: pointer;
      transition: all 0.15s;
      font-family: 'Inter', sans-serif;
    }
    .trigger-bar:hover, .trigger-bar.open {
      border-color: rgba(57, 255, 20, 0.25);
      background: rgba(57, 255, 20, 0.04);
    }
    .trigger-icon {
      flex-shrink: 0;
      display: flex;
    }
    .trigger-label {
      font-size: 11px;
      font-weight: 500;
      color: rgba(57, 255, 20, 0.6);
      flex: 1;
      text-align: left;
    }
    .urgent-badge {
      background: rgba(255, 60, 60, 0.2);
      color: #ff5555;
      font-size: 9px;
      font-weight: 700;
      padding: 1px 6px;
      border-radius: 10px;
      border: 1px solid rgba(255, 60, 60, 0.3);
    }
    .trigger-arrow {
      color: rgba(57, 255, 20, 0.3);
      font-size: 8px;
    }

    /* Dropdown panel */
    .reminders-panel {
      position: absolute;
      top: calc(100% + 6px);
      left: 0;
      right: 0;
      z-index: 30;
      background: rgba(12, 12, 20, 0.95);
      border: 1px solid rgba(57, 255, 20, 0.12);
      border-radius: 10px;
      backdrop-filter: blur(12px);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
      overflow: hidden;
    }
    .panel-scroll {
      max-height: 320px;
      overflow-y: auto;
      padding: 0.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }
    .panel-scroll::-webkit-scrollbar { width: 4px; }
    .panel-scroll::-webkit-scrollbar-track { background: transparent; }
    .panel-scroll::-webkit-scrollbar-thumb { background: rgba(57, 255, 20, 0.15); border-radius: 2px; }

    .reminder-item {
      display: flex;
      align-items: flex-start;
      gap: 0.5rem;
      padding: 0.55rem 0.7rem;
      border-radius: 6px;
      border: 1px solid;
      transition: opacity 0.2s;
    }
    .reminder-item.type-info {
      background: rgba(57, 255, 20, 0.03);
      border-color: rgba(57, 255, 20, 0.08);
    }
    .reminder-item.type-warning {
      background: rgba(255, 191, 0, 0.03);
      border-color: rgba(255, 191, 0, 0.1);
    }
    .reminder-item.type-urgent {
      background: rgba(255, 60, 60, 0.03);
      border-color: rgba(255, 60, 60, 0.1);
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
      font-size: 11px;
      font-weight: 600;
      color: white;
      margin: 0;
    }
    .type-warning .reminder-title { color: #ffbf00; }
    .type-urgent .reminder-title { color: #ff5555; }
    .reminder-msg {
      font-family: 'Inter', sans-serif;
      font-size: 10px;
      color: rgba(255, 255, 255, 0.5);
      margin: 2px 0 0;
      line-height: 1.3;
    }
    .reminder-expires {
      font-family: 'JetBrains Mono', monospace;
      font-size: 8px;
      color: rgba(255, 255, 255, 0.2);
      margin-top: 3px;
      display: block;
    }
    .dismiss-btn {
      flex-shrink: 0;
      background: none;
      border: none;
      color: rgba(255, 255, 255, 0.2);
      font-size: 10px;
      cursor: pointer;
      padding: 2px 4px;
      border-radius: 4px;
      transition: all 0.15s;
      line-height: 1;
    }
    .dismiss-btn:hover {
      color: rgba(255, 255, 255, 0.6);
      background: rgba(255, 255, 255, 0.05);
    }
  `],
})
export class RemindersBannerComponent {
  @Input() reminders: Reminder[] = [];
  panelOpen = false;
  dismissed = new Set<number>();

  constructor(private sanitizer: DomSanitizer, private elRef: ElementRef) {}

  get activeReminders(): Reminder[] {
    return this.reminders.filter((_, i) => !this.dismissed.has(i));
  }

  get urgentCount(): number {
    return this.activeReminders.filter(r => r.type === 'urgent').length;
  }

  get bellIcon(): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#39ff14" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>'
    );
  }

  togglePanel(): void {
    this.panelOpen = !this.panelOpen;
  }

  dismiss(index: number): void {
    const originalIndex = this.reminders.indexOf(this.activeReminders[index]);
    this.dismissed.add(originalIndex);
    if (this.activeReminders.length === 0) {
      this.panelOpen = false;
    }
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    if (this.panelOpen && !this.elRef.nativeElement.contains(event.target)) {
      this.panelOpen = false;
    }
  }

  getIcon(type: string): SafeHtml {
    const icons: Record<string, string> = {
      info: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#39ff14" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
      warning: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ffbf00" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
      urgent: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ff5555" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
    };
    return this.sanitizer.bypassSecurityTrustHtml(icons[type] || icons['info']);
  }

  formatDate(date: string): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
  }
}
