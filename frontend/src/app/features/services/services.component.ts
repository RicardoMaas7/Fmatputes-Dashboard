import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { DashboardService } from '../../shared/services/dashboard.service';
import { AuthService } from '../../shared/services/auth.service';
import { ToastService } from '../../shared/services/toast.service';
import { ConfirmModalService } from '../../shared/services/confirm-modal.service';
import { SharedService } from '../../shared/models';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.css'],
})
export class ServicesComponent implements OnInit {
  services: SharedService[] = [];
  loading = true;

  showForm = false;
  editingId: string | null = null;
  saving = false;
  form = {
    name: '',
    iconUrl: '',
    totalCost: 0,
    perPersonCost: null as number | null,
    nextPaymentDate: '',
    paymentDeadline: '',
  };

  constructor(
    private dashboardService: DashboardService,
    private authService: AuthService,
    private toast: ToastService,
    private confirmModal: ConfirmModalService,
    private sanitizer: DomSanitizer,
  ) {}

  ngOnInit(): void {
    this.loadServices();
  }

  get currentUserId(): string {
    return this.authService.getCurrentUser()?.id || '';
  }

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  loadServices(): void {
    this.dashboardService.getServices().subscribe({
      next: (s) => {
        this.services = s;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.toast.show('Error al cargar servicios', 'error');
      },
    });
  }

  isOwner(service: SharedService): boolean {
    return service.createdBy === this.currentUserId;
  }

  canEdit(service: SharedService): boolean {
    return this.isOwner(service) || this.isAdmin;
  }

  openCreateForm(): void {
    this.editingId = null;
    this.form = { name: '', iconUrl: '', totalCost: 0, perPersonCost: null, nextPaymentDate: '', paymentDeadline: '' };
    this.showForm = true;
  }

  editService(service: SharedService): void {
    this.editingId = service.id;
    this.form = {
      name: service.name,
      iconUrl: service.iconUrl || '',
      totalCost: service.totalCost,
      perPersonCost: service.perPersonCost,
      nextPaymentDate: service.nextPaymentDate || '',
      paymentDeadline: service.paymentDeadline || '',
    };
    this.showForm = true;
  }

  closeForm(): void {
    this.showForm = false;
    this.editingId = null;
  }

  saveService(): void {
    if (!this.form.name) {
      this.toast.show('El nombre es requerido', 'error');
      return;
    }
    this.saving = true;
    const data: any = { ...this.form };
    if (!data.iconUrl) delete data.iconUrl;
    if (!data.nextPaymentDate) delete data.nextPaymentDate;
    if (!data.paymentDeadline) delete data.paymentDeadline;
    if (data.perPersonCost === null || data.perPersonCost === undefined) delete data.perPersonCost;

    const obs = this.editingId
      ? this.dashboardService.updateService(this.editingId, data)
      : this.dashboardService.createService(data);

    obs.subscribe({
      next: () => {
        this.saving = false;
        this.closeForm();
        this.loadServices();
        this.toast.show(this.editingId ? 'Servicio actualizado' : 'Servicio creado', 'success');
      },
      error: (e) => {
        this.saving = false;
        this.toast.show(e.error?.message || 'Error al guardar', 'error');
      },
    });
  }

  async deleteService(service: SharedService): Promise<void> {
    const ok = await this.confirmModal.confirm(
      'Eliminar servicio',
      `¿Eliminar "${service.name}"? Esto eliminará también todas las deudas asociadas.`,
      { type: 'danger' },
    );
    if (!ok) return;
    this.dashboardService.deleteService(service.id).subscribe({
      next: () => {
        this.loadServices();
        this.toast.show('Servicio eliminado', 'success');
      },
      error: (e) => this.toast.show(e.error?.message || 'Error al eliminar', 'error'),
    });
  }

  markPaid(service: SharedService): void {
    this.dashboardService.markServicePaid(service.id).subscribe({
      next: () => {
        this.loadServices();
        this.toast.show('Marcado como pagado', 'success');
      },
      error: (e) => this.toast.show(e.error?.message || 'Error', 'error'),
    });
  }

  getServiceSvg(name: string): SafeHtml {
    const icons: Record<string, string> = {
      'ChatGPT': '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#39ff14" stroke-width="2"><path d="M12 2a10 10 0 0 1 10 10 10 10 0 0 1-10 10A10 10 0 0 1 2 12 10 10 0 0 1 12 2z"/><path d="M8 12h0m4-4v0m4 4h0m-4 4v0"/></svg>',
      'Spotify': '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1db954" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 15c4-1 8 0 8 0"/><path d="M7 12c5-1.5 10 0 10 0"/><path d="M6.5 9c6-2 11 0 11 0"/></svg>',
      'Netflix': '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e50914" stroke-width="2"><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M8 6l8 12M8 18V6m8 0v12"/></svg>',
      'Disney+': '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#113ccf" stroke-width="2"><path d="M12 2l3 7h7l-5.5 4 2 7L12 16l-6.5 4 2-7L2 9h7z"/></svg>',
    };
    return this.sanitizer.bypassSecurityTrustHtml(
      icons[name] ||
      '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#39ff14" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>'
    );
  }
}
