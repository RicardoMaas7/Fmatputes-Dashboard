import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

interface NotificationItem {
  id: string;
  message: string;
  type: 'trophy' | 'transport' | 'payment' | 'general';
  isRead: boolean;
  created_at: string;
}

@Component({
  selector: 'app-notifications-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notif-wrapper animate-fade-in">
      <div class="notif-header">
        <div class="flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#39ff14" stroke-width="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          <span class="text-xs uppercase tracking-[0.2em] font-bold">Alertas</span>
        </div>
        <span *ngIf="unreadCount > 0" class="notif-badge">{{ unreadCount }}</span>
      </div>

      <div class="notif-list">
        <div 
          *ngFor="let notif of notifications"
          class="notif-item"
          [class.is-read]="notif.isRead"
          (click)="markRead(notif)"
          [style.cursor]="notif.isRead ? 'default' : 'pointer'"
          [title]="notif.isRead ? '' : 'Marcar como leída'"
        >
          <div class="notif-icon" [innerHTML]="getIconSvg(notif.type)"></div>
          <p class="notif-text">{{ notif.message }}</p>
        </div>

        <div *ngIf="notifications.length === 0" class="empty-notif">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#39ff14" stroke-width="1" opacity="0.2" class="mx-auto mb-1">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          <span>Sin alertas</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .notif-wrapper {
      background: rgba(14, 14, 22, 0.5);
      border: 1px solid rgba(57, 255, 20, 0.06);
      border-radius: 8px;
      backdrop-filter: blur(6px);
      overflow: hidden;
    }
    .notif-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.6rem 0.75rem;
      border-bottom: 1px solid rgba(57, 255, 20, 0.08);
      color: #39ff14;
    }
    .notif-badge {
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      font-weight: 700;
      background: #39ff14;
      color: #08080c;
      padding: 1px 6px;
      border-radius: 6px;
    }
    .notif-list {
      max-height: 180px;
      overflow-y: auto;
    }
    .notif-item {
      display: flex;
      align-items: flex-start;
      gap: 0.5rem;
      padding: 0.5rem 0.75rem;
      border-bottom: 1px solid rgba(57, 255, 20, 0.04);
      transition: background 0.15s;
    }
    .notif-item:hover { background: rgba(57, 255, 20, 0.03); }
    .notif-item:last-child { border-bottom: none; }
    .notif-item.is-read { opacity: 0.35; }
    .notif-icon { flex-shrink: 0; margin-top: 1px; }
    .notif-text { font-family: 'Inter', sans-serif; font-size: 11px; color: rgba(255,255,255,0.7); line-height: 1.45; }
    .empty-notif {
      text-align: center;
      padding: 1.5rem;
      font-size: 10px;
      color: rgba(57, 255, 20, 0.25);
      text-transform: uppercase;
      letter-spacing: 0.1em;
    }
  `],
})
export class NotificationsPanelComponent {
  @Input() notifications: NotificationItem[] = [];
  @Output() onMarkRead = new EventEmitter<string>();

  constructor(private sanitizer: DomSanitizer) {}

  markRead(notif: NotificationItem): void {
    if (notif.isRead) return;
    notif.isRead = true;
    this.onMarkRead.emit(notif.id);
  }

  get unreadCount(): number {
    return this.notifications.filter(n => !n.isRead).length;
  }

  getIconSvg(type: string): SafeHtml {
    const icons: Record<string, string> = {
      trophy: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffbf00" stroke-width="2"><path d="M6 9H3V5a1 1 0 0 1 1-1h1"/><path d="M18 9h3V5a1 1 0 0 0-1-1h-1"/><path d="M6 4h12v6a6 6 0 0 1-12 0V4z"/><path d="M10 16h4v4H10z"/><path d="M8 20h8"/></svg>',
      transport: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffbf00" stroke-width="2"><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M3 12h18"/><circle cx="7" cy="19" r="1.5"/><circle cx="17" cy="19" r="1.5"/><path d="M5.5 16H3v2.5"/><path d="M18.5 16H21v2.5"/></svg>',
      payment: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#39ff14" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
      general: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#39ff14" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
    };
    return this.sanitizer.bypassSecurityTrustHtml(icons[type] || icons['general']);
  }
}
