import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ConfirmModalService, ModalState } from '../../services/confirm-modal.service';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div *ngIf="state" class="modal-backdrop" (click)="onCancel()">
      <div class="modal-box animate-scale-in" (click)="$event.stopPropagation()">
        <!-- Header -->
        <div class="modal-header">
          <span class="modal-icon">
            <svg *ngIf="isConfirm" width="18" height="18" viewBox="0 0 24 24" fill="none"
              [attr.stroke]="iconColor" stroke-width="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <svg *ngIf="!isConfirm" width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="#ffbf00" stroke-width="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </span>
          <h3 class="modal-title">{{ state.options.title }}</h3>
        </div>

        <!-- Message -->
        <p class="modal-message">{{ state.options.message }}</p>

        <!-- Prompt Input -->
        <input
          *ngIf="!isConfirm"
          [(ngModel)]="promptValue"
          [placeholder]="promptPlaceholder"
          class="modal-input"
          (keyup.enter)="onConfirm()"
          #promptInput
        />

        <!-- Actions -->
        <div class="modal-actions">
          <button class="btn-cancel" (click)="onCancel()">
            {{ state.options.cancelText || 'Cancelar' }}
          </button>
          <button class="btn-confirm" [ngClass]="confirmClass" (click)="onConfirm()">
            {{ state.options.confirmText || (isConfirm ? 'Confirmar' : 'Aceptar') }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-backdrop {
      position: fixed;
      inset: 0;
      z-index: 10000;
      background: rgba(0, 0, 0, 0.65);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      animation: fadeIn 0.15s ease-out;
    }
    .modal-box {
      background: #0e0e16;
      border: 1px solid rgba(57, 255, 20, 0.15);
      border-radius: 12px;
      padding: 1.5rem;
      width: 90%;
      max-width: 380px;
      box-shadow: 0 0 40px rgba(57, 255, 20, 0.06);
    }
    .modal-header {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      margin-bottom: 0.75rem;
    }
    .modal-icon { flex-shrink: 0; }
    .modal-title {
      font-family: 'Inter', sans-serif;
      font-size: 14px;
      font-weight: 700;
      color: white;
      margin: 0;
    }
    .modal-message {
      font-family: 'Inter', sans-serif;
      font-size: 12px;
      color: rgba(255, 255, 255, 0.55);
      line-height: 1.5;
      margin: 0 0 1rem;
    }
    .modal-input {
      width: 100%;
      padding: 0.55rem 0.75rem;
      background: rgba(57, 255, 20, 0.04);
      border: 1px solid rgba(57, 255, 20, 0.12);
      border-radius: 6px;
      color: white;
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      outline: none;
      margin-bottom: 1rem;
      transition: border-color 0.2s;
    }
    .modal-input:focus {
      border-color: rgba(57, 255, 20, 0.4);
    }
    .modal-input::placeholder {
      color: rgba(255, 255, 255, 0.2);
    }
    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
    }
    .btn-cancel, .btn-confirm {
      font-family: 'Inter', sans-serif;
      font-size: 11px;
      font-weight: 600;
      padding: 0.45rem 1rem;
      border-radius: 6px;
      border: 1px solid;
      cursor: pointer;
      transition: all 0.2s;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .btn-cancel {
      background: transparent;
      border-color: rgba(255, 255, 255, 0.1);
      color: rgba(255, 255, 255, 0.5);
    }
    .btn-cancel:hover {
      border-color: rgba(255, 255, 255, 0.25);
      color: white;
    }
    .btn-confirm.danger {
      background: rgba(255, 60, 60, 0.15);
      border-color: rgba(255, 60, 60, 0.4);
      color: #ff5555;
    }
    .btn-confirm.danger:hover {
      background: rgba(255, 60, 60, 0.25);
    }
    .btn-confirm.warning {
      background: rgba(255, 191, 0, 0.12);
      border-color: rgba(255, 191, 0, 0.35);
      color: #ffbf00;
    }
    .btn-confirm.warning:hover {
      background: rgba(255, 191, 0, 0.22);
    }
    .btn-confirm.info {
      background: rgba(57, 255, 20, 0.1);
      border-color: rgba(57, 255, 20, 0.3);
      color: #39ff14;
    }
    .btn-confirm.info:hover {
      background: rgba(57, 255, 20, 0.2);
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes scaleIn {
      from { opacity: 0; transform: scale(0.92); }
      to { opacity: 1; transform: scale(1); }
    }
    .animate-scale-in {
      animation: scaleIn 0.2s ease-out;
    }
  `],
})
export class ConfirmModalComponent implements OnDestroy {
  state: ModalState | null = null;
  promptValue = '';

  private sub: Subscription;

  constructor(private modalService: ConfirmModalService) {
    this.sub = this.modalService.modal$.subscribe((s) => {
      this.state = s;
      this.promptValue = '';
    });
  }

  get isConfirm(): boolean {
    return this.state?.mode === 'confirm';
  }

  get iconColor(): string {
    const type = (this.state?.options as any)?.type || 'danger';
    return type === 'danger' ? '#ff5555' : type === 'warning' ? '#ffbf00' : '#39ff14';
  }

  get confirmClass(): string {
    return (this.state?.options as any)?.type || 'danger';
  }

  get promptPlaceholder(): string {
    return (this.state?.options as any)?.placeholder || '';
  }

  onConfirm(): void {
    if (!this.state) return;
    if (this.isConfirm) {
      this.state.resolve(true);
    } else {
      this.state.resolve(this.promptValue || null);
    }
    this.state = null;
    this.modalService.close();
  }

  onCancel(): void {
    if (!this.state) return;
    this.state.resolve(this.isConfirm ? false : null);
    this.state = null;
    this.modalService.close();
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
