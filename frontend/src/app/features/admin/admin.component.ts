import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../shared/services/admin.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ConfirmModalService } from '../../shared/services/confirm-modal.service';
import { User, SharedService, UserServiceDebt, Transport, Treasury, Reminder } from '../../shared/models';

type Tab = 'users' | 'services' | 'transport' | 'treasury' | 'reminders';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
})
export class AdminComponent implements OnInit {
  activeTab: Tab = 'users';
  loading = false;
  msg: { text: string; type: 'ok' | 'err' } | null = null;

  tabs: { key: Tab; label: string; icon: string }[] = [
    { key: 'users', label: 'Usuarios', icon: 'users' },
    { key: 'services', label: 'Servicios', icon: 'services' },
    { key: 'transport', label: 'Transporte', icon: 'transport' },
    { key: 'treasury', label: 'Tesorería', icon: 'treasury' },
    { key: 'reminders', label: 'Recordatorios', icon: 'reminders' },
  ];

  tabIcons: Record<string, string> = {
    users: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    services: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>',
    transport: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M3 12h18"/><circle cx="7" cy="19" r="1.5"/><circle cx="17" cy="19" r="1.5"/></svg>',
    treasury: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
    reminders: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>',
  };

  /* ─── Users ─── */
  users: User[] = [];
  newUser = { username: '', password: '', displayName: '', birthday: '', role: 'user' };
  showNewUserForm = false;

  /* ─── Services ─── */
  services: SharedService[] = [];
  newService = { name: '', totalCost: 0, nextPaymentDate: '', iconUrl: '' };
  showNewServiceForm = false;
  selectedServiceDebts: UserServiceDebt[] = [];
  selectedServiceId: string | null = null;
  showDebtsModal = false;

  /* ─── Transport ─── */
  transports: Transport[] = [];
  newTransport = { name: '', driverName: '', paradero: '', departureMorning: '', returnMorning: '', totalSeats: 4 };
  showNewTransportForm = false;

  /* ─── Treasury ─── */
  treasury: Treasury | null = null;
  paymentForm = { userId: '', amountPaid: 0 };

  /* ─── Reminders ─── */
  reminders: Reminder[] = [];
  newReminder = { title: '', message: '', type: 'info', expiresAt: '' };
  showNewReminderForm = false;

  constructor(private admin: AdminService, private sanitizer: DomSanitizer, private modal: ConfirmModalService) {}

  getTabIcon(icon: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(this.tabIcons[icon] || '');
  }

  ngOnInit(): void {
    this.loadTab('users');
  }

  switchTab(tab: Tab): void {
    this.activeTab = tab;
    this.msg = null;
    this.loadTab(tab);
  }

  loadTab(tab: Tab): void {
    this.loading = true;
    switch (tab) {
      case 'users':
        this.admin.getUsers().subscribe({
          next: (d) => { this.users = d; this.loading = false; },
          error: () => { this.loading = false; },
        });
        break;
      case 'services':
        this.admin.getServices().subscribe({
          next: (d) => { this.services = d; this.loading = false; },
          error: () => { this.loading = false; },
        });
        break;
      case 'transport':
        this.admin.getTransports().subscribe({
          next: (d) => { this.transports = d; this.loading = false; },
          error: () => { this.loading = false; },
        });
        break;
      case 'treasury':
        this.admin.getTreasury().subscribe({
          next: (d) => { this.treasury = d; this.loading = false; },
          error: () => { this.loading = false; },
        });
        break;
      case 'reminders':
        this.admin.getReminders().subscribe({
          next: (d) => { this.reminders = d; this.loading = false; },
          error: () => { this.loading = false; },
        });
        break;
    }
  }

  flash(text: string, type: 'ok' | 'err'): void {
    this.msg = { text, type };
    setTimeout(() => (this.msg = null), 4000);
  }

  /* ─── User Actions ─── */
  createUser(): void {
    if (!this.newUser.username || !this.newUser.password) return;
    this.admin.createUser(this.newUser).subscribe({
      next: () => {
        this.flash('Usuario creado correctamente.', 'ok');
        this.showNewUserForm = false;
        this.newUser = { username: '', password: '', displayName: '', birthday: '', role: 'user' };
        this.loadTab('users');
      },
      error: (e) => this.flash(e.error?.message || 'Error al crear usuario.', 'err'),
    });
  }

  toggleUserRole(user: User): void {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    this.admin.updateUser(user.id, { role: newRole }).subscribe({
      next: () => {
        user.role = newRole;
        this.flash(`Rol cambiado a ${newRole}.`, 'ok');
      },
      error: () => this.flash('Error al cambiar rol.', 'err'),
    });
  }

  async deleteUser(user: User): Promise<void> {
    const ok = await this.modal.confirm('Eliminar usuario', `¿Eliminar al usuario "${user.username}"? Esta acción no se puede deshacer.`, { type: 'danger' });
    if (!ok) return;
    this.admin.deleteUser(user.id).subscribe({
      next: () => {
        this.flash('Usuario eliminado.', 'ok');
        this.loadTab('users');
      },
      error: (e) => this.flash(e.error?.message || 'Error al eliminar.', 'err'),
    });
  }

  async resetUserPassword(user: User): Promise<void> {
    const newPassword = await this.modal.prompt('Restablecer contraseña', `Nueva contraseña para "${user.username}" (mín. 6 caracteres):`, { placeholder: 'Mínimo 6 caracteres' });
    if (!newPassword || newPassword.length < 6) {
      if (newPassword !== null) this.flash('La contraseña debe tener al menos 6 caracteres.', 'err');
      return;
    }
    this.admin.resetPassword(user.id, newPassword).subscribe({
      next: () => this.flash(`Contraseña de ${user.username} restablecida.`, 'ok'),
      error: (e) => this.flash(e.error?.message || 'Error al restablecer contraseña.', 'err'),
    });
  }

  /* ─── Service Actions ─── */
  createService(): void {
    if (!this.newService.name) return;
    this.admin.createService(this.newService).subscribe({
      next: () => {
        this.flash('Servicio creado.', 'ok');
        this.showNewServiceForm = false;
        this.newService = { name: '', totalCost: 0, nextPaymentDate: '', iconUrl: '' };
        this.loadTab('services');
      },
      error: (e) => this.flash(e.error?.message || 'Error al crear servicio.', 'err'),
    });
  }

  toggleServiceActive(svc: SharedService): void {
    this.admin.updateService(svc.id, { isActive: !svc.isActive }).subscribe({
      next: () => {
        svc.isActive = !svc.isActive;
        this.flash(`Servicio ${svc.isActive ? 'activado' : 'desactivado'}.`, 'ok');
      },
      error: () => this.flash('Error.', 'err'),
    });
  }

  async deleteService(svc: SharedService): Promise<void> {
    const ok = await this.modal.confirm('Eliminar servicio', `¿Eliminar servicio "${svc.name}"? Se borrarán también las deudas asociadas.`, { type: 'danger' });
    if (!ok) return;
    this.admin.deleteService(svc.id).subscribe({
      next: () => {
        this.flash('Servicio eliminado.', 'ok');
        this.loadTab('services');
      },
      error: (e) => this.flash(e.error?.message || 'Error al eliminar.', 'err'),
    });
  }

  saveServiceField(svc: SharedService): void {
    this.admin.updateService(svc.id, {
      totalCost: svc.totalCost,
      nextPaymentDate: svc.nextPaymentDate,
    }).subscribe({
      next: () => this.flash('Servicio actualizado.', 'ok'),
      error: () => this.flash('Error al actualizar servicio.', 'err'),
    });
  }

  openDebts(svc: SharedService): void {
    this.selectedServiceId = svc.id;
    this.showDebtsModal = true;
    this.admin.getServiceDebts(svc.id).subscribe({
      next: (debts) => (this.selectedServiceDebts = debts),
      error: () => this.flash('Error cargando deudas.', 'err'),
    });
  }

  closeDebts(): void {
    this.showDebtsModal = false;
    this.selectedServiceId = null;
    this.selectedServiceDebts = [];
  }

  saveDebt(debt: UserServiceDebt): void {
    if (!this.selectedServiceId) return;
    this.admin.updateServiceDebt(this.selectedServiceId, debt.userId, { pendingBalance: debt.pendingBalance }).subscribe({
      next: () => this.flash('Deuda actualizada.', 'ok'),
      error: () => this.flash('Error actualizando deuda.', 'err'),
    });
  }

  /* ─── Transport Actions ─── */
  createTransport(): void {
    if (!this.newTransport.name) return;
    this.admin.createTransport(this.newTransport).subscribe({
      next: () => {
        this.flash('Transporte creado.', 'ok');
        this.showNewTransportForm = false;
        this.newTransport = { name: '', driverName: '', paradero: '', departureMorning: '', returnMorning: '', totalSeats: 4 };
        this.loadTab('transport');
      },
      error: (e) => this.flash(e.error?.message || 'Error al crear transporte.', 'err'),
    });
  }

  saveTransportField(t: Transport): void {
    this.admin.updateTransport(t.id, {
      driverName: t.driverName,
      paradero: t.paradero,
      totalSeats: t.totalSeats,
      departureMorning: t.departureMorning,
      returnMorning: t.returnMorning,
    }).subscribe({
      next: () => this.flash('Transporte actualizado.', 'ok'),
      error: () => this.flash('Error al actualizar transporte.', 'err'),
    });
  }

  /* ─── Treasury Actions ─── */
  registerPayment(): void {
    if (!this.paymentForm.userId || !this.paymentForm.amountPaid) return;
    this.admin.registerPayment(this.paymentForm).subscribe({
      next: () => {
        this.flash('Pago registrado.', 'ok');
        this.paymentForm = { userId: '', amountPaid: 0 };
        this.loadTab('treasury');
      },
      error: (e) => this.flash(e.error?.message || 'Error.', 'err'),
    });
  }

  saveTreasuryGoal(): void {
    if (!this.treasury) return;
    this.admin.updateTreasury({
      nextGoalAmount: this.treasury.nextGoalAmount,
      nextGoalDescription: this.treasury.nextGoalDescription ?? undefined,
    }).subscribe({
      next: () => this.flash('Meta actualizada.', 'ok'),
      error: () => this.flash('Error al actualizar meta.', 'err'),
    });
  }

  /* ─── Reminder Actions ─── */
  createReminder(): void {
    if (!this.newReminder.title) return;
    this.admin.createReminder(this.newReminder).subscribe({
      next: () => {
        this.flash('Recordatorio creado.', 'ok');
        this.showNewReminderForm = false;
        this.newReminder = { title: '', message: '', type: 'info', expiresAt: '' };
        this.loadTab('reminders');
      },
      error: (e) => this.flash(e.error?.message || 'Error al crear recordatorio.', 'err'),
    });
  }

  toggleReminderActive(r: Reminder): void {
    this.admin.toggleReminder(r.id).subscribe({
      next: (updated) => {
        r.isActive = updated.isActive ?? r.is_active;
        r.is_active = r.isActive;
        this.flash(`Recordatorio ${r.isActive ? 'activado' : 'desactivado'}.`, 'ok');
      },
      error: () => this.flash('Error.', 'err'),
    });
  }

  async deleteReminder(r: Reminder): Promise<void> {
    const ok = await this.modal.confirm('Eliminar recordatorio', `¿Eliminar recordatorio "${r.title}"?`, { type: 'warning' });
    if (!ok) return;
    this.admin.deleteReminder(r.id).subscribe({
      next: () => {
        this.flash('Recordatorio eliminado.', 'ok');
        this.loadTab('reminders');
      },
      error: (e) => this.flash(e.error?.message || 'Error.', 'err'),
    });
  }
}
