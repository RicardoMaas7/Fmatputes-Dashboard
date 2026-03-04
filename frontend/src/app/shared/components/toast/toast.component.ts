import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      <div
        *ngFor="let toast of (toastService.toasts$ | async)"
        class="toast-item animate-slide-up"
        [ngClass]="'toast-' + toast.type"
        (click)="toastService.dismiss(toast.id)"
      >
        <span class="toast-icon">
          <svg *ngIf="toast.type === 'success'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          <svg *ngIf="toast.type === 'error'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          <svg *ngIf="toast.type === 'info'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
        </span>
        <span class="toast-msg">{{ toast.message }}</span>
      </div>
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      bottom: 1.5rem;
      right: 1.5rem;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      max-width: 360px;
    }
    .toast-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.65rem 1rem;
      border-radius: 8px;
      font-size: 12px;
      cursor: pointer;
      border: 1px solid;
      backdrop-filter: blur(8px);
      animation: slideUp 0.25s ease-out;
    }
    .toast-success {
      background: rgba(57, 255, 20, 0.1);
      border-color: rgba(57, 255, 20, 0.3);
      color: #39ff14;
    }
    .toast-error {
      background: rgba(255, 60, 60, 0.1);
      border-color: rgba(255, 60, 60, 0.3);
      color: #ff3c3c;
    }
    .toast-info {
      background: rgba(255, 191, 0, 0.1);
      border-color: rgba(255, 191, 0, 0.3);
      color: #ffbf00;
    }
    .toast-icon { font-weight: 700; }
    .toast-msg { flex: 1; }
    @keyframes slideUp {
      from { opacity: 0; transform: translateY(12px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `],
})
export class ToastComponent {
  constructor(public toastService: ToastService) {}
}
