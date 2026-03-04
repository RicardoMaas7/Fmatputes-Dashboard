import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { DashboardService } from '../../services/dashboard.service';
import { ConfirmModalService } from '../../services/confirm-modal.service';

interface BankAccount {
  id?: string;
  bankName: string;
  accountNumber: string;
  iconUrl?: string;
}

@Component({
  selector: 'app-bank-accounts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-2 animate-fade-in">
      <div 
        *ngFor="let account of accounts; let i = index"
        class="bank-card"
        [ngClass]="getBankClass(account.bankName)"
        [style.animation-delay]="(i * 100) + 'ms'"
      >
        <div class="w-8 h-8 rounded flex items-center justify-center flex-shrink-0"
             [ngClass]="getIconBgClass(account.bankName)">
          <div [innerHTML]="getBankIcon(account.bankName)"></div>
        </div>
        <div class="min-w-0 flex-1">
          <p class="text-xs font-bold text-white leading-tight">{{ account.bankName }}</p>
          <p class="text-[10px] text-wired-dim-light font-mono tracking-wider mt-0.5">
            {{ maskAccount(account.accountNumber) }}
          </p>
        </div>
        <button (click)="removeAccount(account)" 
                class="text-red-500/30 hover:text-red-400 transition-colors flex-shrink-0"
                title="Eliminar cuenta">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <div *ngIf="accounts.length === 0 && !showAddForm" 
           class="text-center text-wired-dim-light text-[10px] p-3 border border-dashed border-wired-dim opacity-40">
        SIN CUENTAS
      </div>

      <!-- Add Account Form -->
      <div *ngIf="showAddForm" class="p-3 border border-wired-neon/15 rounded animate-fade-in" style="background: rgba(10,10,10,0.8);">
        <select [(ngModel)]="newAccount.bankName" class="neon-input text-xs w-full mb-2" style="background: rgba(14,14,20,0.9);">
          <option value="">Seleccionar banco...</option>
          <option value="BBVA">BBVA</option>
          <option value="NU">NU</option>
          <option value="PLATA">PLATA</option>
          <option value="PAYPAL">PAYPAL</option>
        </select>
        <input [(ngModel)]="newAccount.accountNumber" placeholder="Número de cuenta" class="neon-input text-xs w-full mb-2" />
        <div class="flex gap-2">
          <button (click)="addAccount()" class="neon-btn text-[10px] px-3 py-1 flex-1">AGREGAR</button>
          <button (click)="showAddForm = false" class="text-[10px] text-wired-dim-light hover:text-white px-2">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      </div>

      <!-- Add Button -->
      <button *ngIf="!showAddForm" 
              (click)="showAddForm = true"
              class="w-full text-center text-[10px] text-wired-neon/40 hover:text-wired-neon/80 py-2 border border-dashed border-wired-neon/10 hover:border-wired-neon/25 rounded transition-all">
        + Agregar cuenta
      </button>
    </div>
  `,
})
export class BankAccountsComponent {
  @Input() accounts: BankAccount[] = [];
  @Output() accountsChanged = new EventEmitter<void>();

  showAddForm = false;
  newAccount = { bankName: '', accountNumber: '' };

  constructor(
    private sanitizer: DomSanitizer,
    private dashboard: DashboardService,
    private modal: ConfirmModalService,
  ) {}

  addAccount(): void {
    if (!this.newAccount.bankName || !this.newAccount.accountNumber) return;
    this.dashboard.createBankAccount(this.newAccount).subscribe({
      next: (created) => {
        this.accounts.push(created);
        this.newAccount = { bankName: '', accountNumber: '' };
        this.showAddForm = false;
        this.accountsChanged.emit();
      },
      error: (e) => console.error('Error adding account:', e),
    });
  }

  async removeAccount(account: BankAccount): Promise<void> {
    if (!account.id) return;
    const ok = await this.modal.confirm('Eliminar cuenta', `¿Eliminar la cuenta ${account.bankName}?`, { type: 'danger' });
    if (!ok) return;
    this.dashboard.deleteBankAccount(account.id).subscribe({
      next: () => {
        this.accounts = this.accounts.filter(a => a.id !== account.id);
        this.accountsChanged.emit();
      },
      error: (e) => console.error('Error removing account:', e),
    });
  }

  getBankClass(bank: string): string {
    return bank.toLowerCase();
  }

  getIconBgClass(bank: string): string {
    const classes: Record<string, string> = {
      'BBVA': 'bg-blue-900/50',
      'PLATA': 'bg-orange-900/50',
      'NU': 'bg-purple-900/50',
      'PAYPAL': 'bg-sky-900/50',
    };
    return classes[bank] || 'bg-wired-dim';
  }

  getBankIcon(bank: string): SafeHtml {
    const icons: Record<string, string> = {
      'BBVA': '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" stroke-width="2"><rect x="3" y="8" width="18" height="12" rx="1"/><path d="M7 8V6a5 5 0 0 1 10 0v2"/></svg>',
      'PLATA': '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fb923c" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>',
      'NU': '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c084fc" stroke-width="2"><path d="M12 2l3 7h7l-5.5 4 2 7L12 16l-6.5 4 2-7L2 9h7z"/></svg>',
      'PAYPAL': '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 12h4c2 0 3-1 3-2.5S14 7 12 7H9l-1 10"/><path d="M10 12h4c2 0 3 1 3 2.5S15 17 13 17h-4"/></svg>',
    };
    return this.sanitizer.bypassSecurityTrustHtml(icons[bank] || '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#39ff14" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>');
  }

  maskAccount(num: string): string {
    if (!num) return 'XXXX XXXX XXXX XXXX';
    const clean = num.replace(/\s/g, '');
    if (clean.length <= 4) return clean;
    const masked = 'X'.repeat(clean.length - 4) + clean.slice(-4);
    return masked.match(/.{1,4}/g)?.join(' ') || masked;
  }
}
