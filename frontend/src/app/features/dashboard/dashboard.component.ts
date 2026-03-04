import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardService } from '../../shared/services/dashboard.service';
import { AuthService } from '../../shared/services/auth.service';
import { ProfileCardComponent } from '../../shared/components/profile-card/profile-card.component';
import { BankAccountsComponent } from '../../shared/components/bank-accounts/bank-accounts.component';
import { RadarChartComponent } from '../../shared/components/radar-chart/radar-chart.component';
import { NotificationsPanelComponent } from '../../shared/components/notifications-panel/notifications-panel.component';
import { ServicesPanelComponent } from '../../shared/components/services-panel/services-panel.component';
import { RemindersBannerComponent } from '../../shared/components/reminders-banner/reminders-banner.component';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ProfileCardComponent,
    BankAccountsComponent,
    RadarChartComponent,
    NotificationsPanelComponent,
    ServicesPanelComponent,
    RemindersBannerComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  // User data
  user: any = null;
  bankAccounts: any[] = [];

  // Radar
  radarSvg = '';
  radarStats: Record<string, number> | null = null;
  isRadarLoading = true;

  // Services
  services: any[] = [];
  transports: any[] = [];
  treasury: any = null;

  // Notifications
  notifications: any[] = [];

  // Reminders
  reminders: any[] = [];

  // Loading
  isLoading = true;

  // Period filter
  selectedPeriod = '';
  periods: string[] = [];

  constructor(
    private dashboardService: DashboardService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.generatePeriods();
    this.loadDashboard();
  }

  private generatePeriods(): void {
    const now = new Date();
    const year = now.getFullYear();
    const q = Math.ceil((now.getMonth() + 1) / 3);
    // Generate current + 3 previous quarters
    for (let i = 0; i < 4; i++) {
      let pYear = year;
      let pQ = q - i;
      while (pQ <= 0) { pQ += 4; pYear--; }
      this.periods.push(`${pYear}-Q${pQ}`);
    }
    this.selectedPeriod = ''; // empty = all time
  }

  private loadDashboard(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;

    // Load all dashboard data in parallel
    forkJoin({
      me: this.dashboardService.getMe(),
      services: this.dashboardService.getServices(),
      transports: this.dashboardService.getTransports(),
      treasury: this.dashboardService.getTreasury(),
      notifications: this.dashboardService.getNotifications(),
      reminders: this.dashboardService.getReminders(),
      radar: this.dashboardService.getRadarSvg(currentUser.id, this.selectedPeriod || undefined),
    }).subscribe({
      next: (data) => {
        // User
        this.user = data.me;
        this.bankAccounts = data.me.bankAccounts || [];

        // Services
        this.services = data.services || [];
        this.transports = data.transports || [];
        this.treasury = data.treasury;

        // Notifications
        this.notifications = data.notifications || [];

        // Reminders
        this.reminders = data.reminders || [];

        // Radar
        this.radarSvg = data.radar?.svg || '';
        this.radarStats = data.radar?.stats || null;
        this.isRadarLoading = false;

        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading dashboard:', err);
        this.isLoading = false;
        this.isRadarLoading = false;
      },
    });
  }

  get displayName(): string {
    return this.user?.displayName || this.user?.username || '';
  }

  get formattedBirthday(): string {
    if (!this.user?.birthday) return '';
    const date = new Date(this.user.birthday + 'T12:00:00');
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${date.getDate()} ${months[date.getMonth()]}`;
  }

  onPeriodChange(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;
    this.isRadarLoading = true;
    this.dashboardService.getRadarSvg(currentUser.id, this.selectedPeriod || undefined).subscribe({
      next: (data) => {
        this.radarSvg = data?.svg || '';
        this.radarStats = data?.stats || null;
        this.isRadarLoading = false;
      },
      error: () => {
        this.isRadarLoading = false;
      },
    });
  }

  handleMarkRead(notifId: string): void {
    this.dashboardService.markNotificationRead(notifId).subscribe();
  }
}
