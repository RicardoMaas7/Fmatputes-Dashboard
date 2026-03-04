import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardService } from '../../shared/services/dashboard.service';
import { AuthService } from '../../shared/services/auth.service';
import { ToastService } from '../../shared/services/toast.service';
import { ConfirmModalService } from '../../shared/services/confirm-modal.service';
import { Reminder, Team } from '../../shared/models';

interface CalendarDay {
  date: Date;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  reminders: Reminder[];
}

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css'],
})
export class CalendarComponent implements OnInit {
  loading = true;
  reminders: Reminder[] = [];
  weeks: CalendarDay[][] = [];
  currentDate = new Date();
  currentYear = this.currentDate.getFullYear();
  currentMonth = this.currentDate.getMonth();

  // Add form
  showAddForm = false;
  saving = false;
  newReminder = {
    title: '',
    message: '',
    type: 'info' as 'info' | 'warning' | 'urgent',
    expiresAt: '',
  };

  selectedDay: CalendarDay | null = null;

  // Teams for "Remind team"
  teams: Team[] = [];
  notifyTeamId: string = '';
  notifyingReminderId: string | null = null;

  readonly MONTHS = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ];
  readonly DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  constructor(
    private dashboard: DashboardService,
    private authService: AuthService,
    private toast: ToastService,
    private modal: ConfirmModalService,
  ) {}

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  ngOnInit(): void {
    this.loadReminders();
    this.dashboard.getTeams().subscribe({ next: (t) => (this.teams = t) });
  }

  loadReminders(): void {
    this.loading = true;
    const obs = this.isAdmin
      ? this.dashboard.getAllReminders()
      : this.dashboard.getReminders();

    obs.subscribe({
      next: (reminders) => {
        this.reminders = reminders;
        this.buildCalendar();
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  buildCalendar(): void {
    const year = this.currentYear;
    const month = this.currentMonth;
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Monday-based week: 0=Mon, 6=Sun
    let startDow = firstDay.getDay() - 1;
    if (startDow < 0) startDow = 6;

    const days: CalendarDay[] = [];
    const today = new Date();

    // Previous month padding
    for (let i = startDow - 1; i >= 0; i--) {
      const d = new Date(year, month, -i);
      days.push(this.makeDay(d, false, today));
    }

    // Current month
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const date = new Date(year, month, d);
      days.push(this.makeDay(date, true, today));
    }

    // Next month padding
    while (days.length % 7 !== 0) {
      const d = new Date(year, month + 1, days.length - lastDay.getDate() - startDow + 1);
      days.push(this.makeDay(d, false, today));
    }

    // Split into weeks
    this.weeks = [];
    for (let i = 0; i < days.length; i += 7) {
      this.weeks.push(days.slice(i, i + 7));
    }
  }

  private makeDay(date: Date, isCurrentMonth: boolean, today: Date): CalendarDay {
    const dateStr = this.toDateStr(date);
    const reminders = this.reminders.filter((r) => {
      const exp = r.expiresAt || r.expires_at;
      if (!exp) return false;
      return exp.substring(0, 10) === dateStr;
    });

    return {
      date,
      day: date.getDate(),
      isCurrentMonth,
      isToday:
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear(),
      reminders,
    };
  }

  private toDateStr(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  prevMonth(): void {
    if (this.currentMonth === 0) {
      this.currentMonth = 11;
      this.currentYear--;
    } else {
      this.currentMonth--;
    }
    this.buildCalendar();
  }

  nextMonth(): void {
    if (this.currentMonth === 11) {
      this.currentMonth = 0;
      this.currentYear++;
    } else {
      this.currentMonth++;
    }
    this.buildCalendar();
  }

  goToToday(): void {
    const now = new Date();
    this.currentYear = now.getFullYear();
    this.currentMonth = now.getMonth();
    this.buildCalendar();
  }

  selectDay(day: CalendarDay): void {
    this.selectedDay = this.selectedDay === day ? null : day;
  }

  openAddForm(day?: CalendarDay): void {
    this.showAddForm = true;
    this.newReminder = {
      title: '',
      message: '',
      type: 'info',
      expiresAt: day ? this.toDateStr(day.date) : '',
    };
  }

  cancelAdd(): void {
    this.showAddForm = false;
  }

  saveReminder(): void {
    if (!this.newReminder.title.trim()) return;
    this.saving = true;
    this.dashboard.createReminder({
      title: this.newReminder.title,
      message: this.newReminder.message || undefined,
      type: this.newReminder.type,
      expiresAt: this.newReminder.expiresAt || undefined,
    }).subscribe({
      next: () => {
        this.saving = false;
        this.showAddForm = false;
        this.loadReminders();
      },
      error: () => (this.saving = false),
    });
  }

  async deleteReminder(r: Reminder): Promise<void> {
    const ok = await this.modal.confirm(
      'Eliminar recordatorio',
      `¿Eliminar "${r.title}"?`,
      { type: 'danger' },
    );
    if (!ok) return;
    this.dashboard.deleteReminder(r.id).subscribe({
      next: () => this.loadReminders(),
    });
  }

  toggleReminder(r: Reminder): void {
    this.dashboard.toggleReminder(r.id).subscribe({
      next: () => this.loadReminders(),
    });
  }

  getTypeColor(type: string): string {
    switch (type) {
      case 'urgent': return 'border-red-500 bg-red-500/10';
      case 'warning': return 'border-yellow-500 bg-yellow-500/10';
      default: return 'border-blue-500 bg-blue-500/10';
    }
  }

  getTypeBadge(type: string): string {
    switch (type) {
      case 'urgent': return 'bg-red-500/20 text-red-400';
      case 'warning': return 'bg-yellow-500/20 text-yellow-400';
      default: return 'bg-blue-500/20 text-blue-400';
    }
  }

  getDotColor(type: string): string {
    switch (type) {
      case 'urgent': return 'bg-red-500';
      case 'warning': return 'bg-yellow-500';
      default: return 'bg-blue-500';
    }
  }

  openNotifyTeam(reminderId: string): void {
    this.notifyingReminderId = this.notifyingReminderId === reminderId ? null : reminderId;
    this.notifyTeamId = '';
  }

  sendTeamNotification(reminderId: string): void {
    if (!this.notifyTeamId) return;
    this.dashboard.notifyTeam(reminderId, this.notifyTeamId).subscribe({
      next: (res) => {
        this.toast.show(res.message, 'success');
        this.notifyingReminderId = null;
        this.notifyTeamId = '';
      },
      error: () => this.toast.show('Error al notificar al equipo', 'error'),
    });
  }
}
