import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-services-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="services-wrapper animate-fade-in">
      <!-- Section: Services -->
      <div class="section-header">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
        </svg>
        <span>Servicios</span>
      </div>

      <div *ngFor="let service of services" class="svc-card">
        <div class="svc-icon" [innerHTML]="getServiceSvg(service.name)"></div>
        <div class="svc-body">
          <h4 class="svc-name">{{ service.name }}</h4>
          <div class="svc-meta">
            <span>Pendiente: <strong class="text-wired-neon">\${{ service.pendingBalance?.toFixed(2) || '0.00' }}</strong></span>
          </div>
          <div class="svc-meta">
            Pr&oacute;ximo pago: <span class="text-white">{{ service.nextPaymentDate || '—' }}</span>
          </div>
        </div>
      </div>

      <!-- Section: Transport -->
      <div *ngIf="transports.length > 0" class="section-header mt-3">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="4" width="18" height="12" rx="2"/><path d="M3 12h18"/><circle cx="7" cy="19" r="1.5"/><circle cx="17" cy="19" r="1.5"/>
        </svg>
        <span>Transporte</span>
      </div>

      <div *ngFor="let transport of transports" class="svc-card transport-accent">
        <div class="svc-icon amber">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffbf00" stroke-width="2">
            <rect x="3" y="4" width="18" height="12" rx="2"/><path d="M3 12h18"/><circle cx="7" cy="19" r="1.5"/><circle cx="17" cy="19" r="1.5"/>
          </svg>
        </div>
        <div class="svc-body">
          <h4 class="svc-name text-wired-amber">{{ transport.name }}</h4>
          <div class="svc-meta">
            Pendiente: <strong class="text-white">\${{ transport.userPendingBalance?.toFixed(2) || '0.00' }}</strong>
          </div>
          <div class="svc-meta" *ngIf="transport.paradero">
            <span class="text-white">{{ transport.paradero }}</span>
          </div>
          <div class="svc-meta">
            Ida: {{ transport.departureMorning || '—' }} &middot; Vuelta: {{ transport.returnMorning || '—' }}
          </div>
          <div class="cupos">
            <span class="cupo-label">Cupos</span>
            <span
              *ngFor="let seat of getSeatIndicators(transport)"
              class="cupo-dot"
              [ngClass]="seat ? 'occupied' : 'available'"
            ></span>
          </div>
        </div>
      </div>

      <!-- Section: Treasury -->
      <div *ngIf="treasury" class="section-header mt-3">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
        </svg>
        <span>Tesoreria</span>
      </div>

      <div *ngIf="treasury" class="svc-card treasury-accent">
        <div class="svc-icon neon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#39ff14" stroke-width="2">
            <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
          </svg>
        </div>
        <div class="svc-body">
          <h4 class="svc-name text-wired-neon">{{ treasury.name }}</h4>
          <div class="svc-meta">
            Tu aporte: <strong class="text-white">\${{ treasury.userTotalPaid?.toFixed(2) || '0.00' }}</strong>
          </div>
          <div class="svc-meta">
            Recaudado: <strong class="text-wired-neon">\${{ treasury.totalCollected?.toFixed(2) || '0.00' }}</strong>
          </div>
          <div *ngIf="treasury.nextGoalDescription" class="svc-meta">
            Meta: {{ treasury.nextGoalDescription }}
          </div>
          <div class="progress-track">
            <div class="progress-fill" [style.width.%]="treasury.progress || 0"></div>
          </div>
        </div>
      </div>

      <div *ngIf="services.length === 0 && transports.length === 0 && !treasury"
           class="empty-svc">
        SIN SERVICIOS
      </div>
    </div>
  `,
  styles: [`
    .services-wrapper {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .section-header {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.2em;
      font-weight: 700;
      color: rgba(57, 255, 20, 0.5);
      padding: 0 0.25rem;
    }
    .svc-card {
      display: flex;
      align-items: flex-start;
      gap: 0.6rem;
      padding: 0.65rem 0.75rem;
      background: rgba(14, 14, 22, 0.5);
      border: 1px solid rgba(57, 255, 20, 0.06);
      border-radius: 8px;
      backdrop-filter: blur(6px);
      transition: border-color 0.25s cubic-bezier(.4,0,.2,1), background 0.25s;
    }
    .svc-card:hover { border-color: rgba(57, 255, 20, 0.15); background: rgba(14,14,22,0.7); }
    .transport-accent { border-left: 2px solid rgba(255, 191, 0, 0.35); }
    .treasury-accent { border-left: 2px solid rgba(57, 255, 20, 0.35); }
    .svc-icon {
      flex-shrink: 0;
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(57, 255, 20, 0.06);
      border-radius: 6px;
      margin-top: 1px;
    }
    .svc-icon.amber { background: rgba(255, 191, 0, 0.08); }
    .svc-icon.neon { background: rgba(57, 255, 20, 0.08); }
    .svc-body { flex: 1; min-width: 0; }
    .svc-name { font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 600; color: white; margin: 0; }
    .svc-meta { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: rgba(255,255,255,0.35); margin-top: 2px; }
    .cupos {
      display: flex;
      align-items: center;
      gap: 3px;
      margin-top: 6px;
    }
    .cupo-label { font-size: 9px; color: rgba(255,255,255,0.25); margin-right: 2px; }
    .cupo-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }
    .cupo-dot.available {
      background: #39ff14;
      box-shadow: 0 0 4px #39ff14;
    }
    .cupo-dot.occupied {
      background: #ff3333;
      opacity: 0.6;
    }
    .progress-track {
      height: 4px;
      background: rgba(57, 255, 20, 0.08);
      border-radius: 4px;
      margin-top: 6px;
      overflow: hidden;
    }
    .progress-fill {
      height: 100%;
      background: #39ff14;
      border-radius: 4px;
      transition: width 0.7s ease-out;
      box-shadow: 0 0 6px rgba(57, 255, 20, 0.4);
    }
    .empty-svc {
      text-align: center;
      font-family: 'Inter', sans-serif;
      font-size: 10px;
      color: rgba(57, 255, 20, 0.2);
      padding: 2rem;
      border: 1px dashed rgba(57, 255, 20, 0.08);
      border-radius: 8px;
      text-transform: uppercase;
      letter-spacing: 0.15em;
    }
  `],
})
export class ServicesPanelComponent {
  @Input() services: any[] = [];
  @Input() transports: any[] = [];
  @Input() treasury: any = null;

  constructor(private sanitizer: DomSanitizer) {}

  getServiceSvg(name: string): SafeHtml {
    const icons: Record<string, string> = {
      'ChatGPT': '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#39ff14" stroke-width="2"><path d="M12 2a10 10 0 0 1 10 10 10 10 0 0 1-10 10A10 10 0 0 1 2 12 10 10 0 0 1 12 2z"/><path d="M8 12h0m4-4v0m4 4h0m-4 4v0"/></svg>',
      'Spotify': '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1db954" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 15c4-1 8 0 8 0"/><path d="M7 12c5-1.5 10 0 10 0"/><path d="M6.5 9c6-2 11 0 11 0"/></svg>',
      'Netflix': '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#e50914" stroke-width="2"><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M8 6l8 12M8 18V6m8 0v12"/></svg>',
      'Disney+': '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#113ccf" stroke-width="2"><path d="M12 2l3 7h7l-5.5 4 2 7L12 16l-6.5 4 2-7L2 9h7z"/></svg>',
    };
    return this.sanitizer.bypassSecurityTrustHtml(icons[name] || '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#39ff14" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>');
  }

  getSeatIndicators(transport: any): boolean[] {
    const total = transport.totalSeats || 4;
    const occupied = transport.occupiedSeats || 0;
    const indicators: boolean[] = [];
    for (let i = 0; i < total; i++) {
      indicators.push(i < occupied);
    }
    return indicators;
  }
}
