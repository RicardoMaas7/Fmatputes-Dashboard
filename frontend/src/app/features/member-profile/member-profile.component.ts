import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DashboardService } from '../../shared/services/dashboard.service';
import { ProfileCardComponent } from '../../shared/components/profile-card/profile-card.component';
import { RadarChartComponent } from '../../shared/components/radar-chart/radar-chart.component';

@Component({
  selector: 'app-member-profile',
  standalone: true,
  imports: [CommonModule, ProfileCardComponent, RadarChartComponent],
  template: `
    <!-- Loading -->
    <div *ngIf="isLoading" class="flex items-center justify-center h-[60vh]">
      <div class="w-10 h-10 border-2 border-wired-neon border-t-transparent rounded-full animate-spin"></div>
    </div>

    <!-- Not found -->
    <div *ngIf="!isLoading && !member" class="text-center py-20 animate-fade-in">
      <p class="text-wired-dim-light text-sm">Miembro no encontrado.</p>
      <button class="neon-btn mt-4 px-4 py-2 text-xs" (click)="goBack()">Volver</button>
    </div>

    <!-- Profile Content -->
    <div *ngIf="!isLoading && member" class="member-layout p-4 animate-fade-in">
      <!-- Back button -->
      <button class="back-btn" (click)="goBack()">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
        Equipo
      </button>

      <div class="member-grid">
        <!-- Left: Profile Card -->
        <div class="left-col space-y-4">
          <app-profile-card
            [displayName]="member.displayName"
            [photoUrl]="member.profilePhotoUrl || ''"
            [birthday]="formattedBirthday"
          ></app-profile-card>

          <!-- Info card -->
          <div class="info-card">
            <div class="info-row">
              <span class="info-label">Usuario</span>
              <span class="info-value">{{ member.username }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Rol</span>
              <span class="info-value" [class.text-wired-amber]="member.role === 'admin'">
                {{ member.role === 'admin' ? 'Administrador' : 'Miembro' }}
              </span>
            </div>
            <div class="info-row" *ngIf="member.birthday">
              <span class="info-label">Cumpleaños</span>
              <span class="info-value">{{ formattedBirthday }}</span>
            </div>
          </div>

          <!-- Bank Accounts (read-only view) -->
          <div *ngIf="member.bankAccounts && member.bankAccounts.length > 0" class="info-card">
            <h4 class="info-section-title">Cuentas Bancarias</h4>
            <div *ngFor="let acc of member.bankAccounts" class="bank-item">
              <span class="bank-name">{{ acc.bankName }}</span>
              <span class="bank-number">{{ acc.accountNumber }}</span>
            </div>
          </div>
        </div>

        <!-- Right: Radar Chart -->
        <div class="right-col space-y-4">
          <app-radar-chart
            [svgContent]="radarSvg"
            [userName]="member.displayName"
            [stats]="radarStats"
            [isLoading]="isRadarLoading"
          ></app-radar-chart>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .member-layout {
      max-width: 900px;
      margin: 0 auto;
    }
    .back-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      font-family: 'Inter', sans-serif;
      font-size: 12px;
      font-weight: 500;
      color: rgba(57, 255, 20, 0.5);
      background: none;
      border: none;
      cursor: pointer;
      padding: 0;
      margin-bottom: 1rem;
      transition: color 0.2s;
    }
    .back-btn:hover { color: #39ff14; }
    .member-grid {
      display: grid;
      grid-template-columns: 240px 1fr;
      gap: 1.25rem;
    }
    .left-col {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .right-col {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .info-card {
      background: rgba(14, 14, 22, 0.65);
      border: 1px solid rgba(57, 255, 20, 0.06);
      border-radius: 8px;
      backdrop-filter: blur(6px);
      padding: 1rem;
    }
    .info-section-title {
      font-family: 'Inter', sans-serif;
      font-size: 11px;
      font-weight: 600;
      color: rgba(57, 255, 20, 0.4);
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin: 0 0 0.75rem;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 0.4rem 0;
      border-bottom: 1px solid rgba(57, 255, 20, 0.04);
    }
    .info-row:last-child { border-bottom: none; }
    .info-label {
      font-family: 'Inter', sans-serif;
      font-size: 11px;
      color: rgba(57, 255, 20, 0.35);
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }
    .info-value {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      color: rgba(255, 255, 255, 0.8);
    }
    .bank-item {
      display: flex;
      justify-content: space-between;
      padding: 0.35rem 0;
      border-bottom: 1px solid rgba(57, 255, 20, 0.04);
    }
    .bank-item:last-child { border-bottom: none; }
    .bank-name {
      font-family: 'Inter', sans-serif;
      font-size: 11px;
      color: rgba(255, 255, 255, 0.6);
    }
    .bank-number {
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      color: rgba(57, 255, 20, 0.5);
    }
    @media (max-width: 768px) {
      .member-grid {
        grid-template-columns: 1fr;
      }
    }
  `],
})
export class MemberProfileComponent implements OnInit {
  member: any = null;
  isLoading = true;
  isRadarLoading = false;
  radarSvg = '';
  radarStats: Record<string, number> | null = null;
  formattedBirthday = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dashboardService: DashboardService,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.isLoading = false;
      return;
    }

    this.dashboardService.getUser(id).subscribe({
      next: (user) => {
        this.member = user;
        this.formattedBirthday = user.birthday
          ? new Date(user.birthday).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
          : '';
        this.isLoading = false;
        this.loadRadar(id);
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  private loadRadar(userId: string): void {
    this.isRadarLoading = true;
    this.dashboardService.getRadarSvg(userId).subscribe({
      next: (res) => {
        this.radarSvg = res.svg || '';
        this.isRadarLoading = false;
      },
      error: () => {
        this.isRadarLoading = false;
      },
    });

    this.dashboardService.getVoteResults(userId).subscribe({
      next: (res) => {
        if (res.averages) {
          this.radarStats = res.averages;
        }
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/team']);
  }
}
