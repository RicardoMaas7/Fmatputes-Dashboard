import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardService } from '../../shared/services/dashboard.service';
import { AuthService } from '../../shared/services/auth.service';
import { ToastService } from '../../shared/services/toast.service';
import { ConfirmModalService } from '../../shared/services/confirm-modal.service';
import { Transport, TransportSeat } from '../../shared/models';

@Component({
  selector: 'app-transport',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './transport.component.html',
  styleUrls: ['./transport.component.css'],
})
export class TransportComponent implements OnInit {
  transports: Transport[] = [];
  loading = true;

  // Create / Edit form
  showForm = false;
  editingId: string | null = null;
  form = { name: '', driverName: '', paradero: '', departureMorning: '', returnMorning: '', totalSeats: 4 };
  saving = false;

  // Priority reorder
  reorderingId: string | null = null;
  reorderSeats: TransportSeat[] = [];
  dragIndex: number | null = null;

  constructor(
    private dashboardService: DashboardService,
    private authService: AuthService,
    private toast: ToastService,
    private confirmModal: ConfirmModalService,
  ) {}

  ngOnInit(): void {
    this.loadTransports();
  }

  get currentUserId(): string {
    return this.authService.getCurrentUser()?.id || '';
  }

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  isOwner(transport: Transport): boolean {
    return transport.ownerId === this.currentUserId;
  }

  canEdit(transport: Transport): boolean {
    return this.isOwner(transport) || this.isAdmin;
  }

  hasSeat(transport: Transport): boolean {
    return transport.seats?.some(s => s.userId === this.currentUserId) || false;
  }

  loadTransports(): void {
    this.loading = true;
    this.dashboardService.getTransports().subscribe({
      next: (data) => {
        this.transports = data;
        this.loading = false;
      },
      error: () => {
        this.toast.error('Error al cargar transportes.');
        this.loading = false;
      },
    });
  }

  // ─── CRUD ───

  openCreateForm(): void {
    this.editingId = null;
    this.form = { name: '', driverName: '', paradero: '', departureMorning: '', returnMorning: '', totalSeats: 4 };
    this.showForm = true;
  }

  openEditForm(t: Transport): void {
    this.editingId = t.id;
    this.form = {
      name: t.name,
      driverName: t.driverName || '',
      paradero: t.paradero || '',
      departureMorning: t.departureMorning || '',
      returnMorning: t.returnMorning || '',
      totalSeats: t.totalSeats,
    };
    this.showForm = true;
  }

  cancelForm(): void {
    this.showForm = false;
    this.editingId = null;
  }

  saveTransport(): void {
    if (!this.form.name.trim()) {
      this.toast.error('El nombre es obligatorio.');
      return;
    }
    this.saving = true;

    const payload: Partial<Transport> = {
      name: this.form.name.trim(),
      driverName: this.form.driverName.trim() || null,
      paradero: this.form.paradero.trim() || null,
      departureMorning: this.form.departureMorning || null,
      returnMorning: this.form.returnMorning || null,
      totalSeats: this.form.totalSeats,
    };

    const obs = this.editingId
      ? this.dashboardService.updateTransport(this.editingId, payload)
      : this.dashboardService.createTransport(payload);

    obs.subscribe({
      next: () => {
        this.toast.success(this.editingId ? 'Transporte actualizado.' : 'Transporte creado.');
        this.showForm = false;
        this.editingId = null;
        this.saving = false;
        this.loadTransports();
      },
      error: (err) => {
        this.toast.error(err.error?.message || 'Error al guardar.');
        this.saving = false;
      },
    });
  }

  async deleteTransport(t: Transport): Promise<void> {
    const confirmed = await this.confirmModal.confirm(
      'Eliminar Transporte',
      `¿Eliminar "${t.name}"? Se borrarán todos los asientos.`,
      { confirmText: 'Eliminar' }
    );
    if (!confirmed) return;

    this.dashboardService.deleteTransport(t.id).subscribe({
      next: () => {
        this.toast.success('Transporte eliminado.');
        this.loadTransports();
      },
      error: (err) => this.toast.error(err.error?.message || 'Error al eliminar.'),
    });
  }

  // ─── Seat Reserve / Cancel ───

  reserveSeat(t: Transport): void {
    this.dashboardService.reserveSeat(t.id).subscribe({
      next: () => {
        this.toast.success('Asiento reservado.');
        this.loadTransports();
      },
      error: (err) => this.toast.error(err.error?.message || 'Error al reservar.'),
    });
  }

  cancelSeat(t: Transport): void {
    this.dashboardService.cancelSeat(t.id).subscribe({
      next: () => {
        this.toast.success('Reservación cancelada.');
        this.loadTransports();
      },
      error: (err) => this.toast.error(err.error?.message || 'Error al cancelar.'),
    });
  }

  // ─── Priority reorder (drag & drop) ───

  startReorder(t: Transport): void {
    this.reorderingId = t.id;
    this.reorderSeats = [...t.seats];
  }

  cancelReorder(): void {
    this.reorderingId = null;
    this.reorderSeats = [];
    this.dragIndex = null;
  }

  onDragStart(index: number): void {
    this.dragIndex = index;
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  onDrop(index: number): void {
    if (this.dragIndex === null || this.dragIndex === index) return;
    const item = this.reorderSeats.splice(this.dragIndex, 1)[0];
    this.reorderSeats.splice(index, 0, item);
    this.dragIndex = null;
  }

  moveUp(index: number): void {
    if (index === 0) return;
    [this.reorderSeats[index - 1], this.reorderSeats[index]] =
      [this.reorderSeats[index], this.reorderSeats[index - 1]];
  }

  moveDown(index: number): void {
    if (index >= this.reorderSeats.length - 1) return;
    [this.reorderSeats[index], this.reorderSeats[index + 1]] =
      [this.reorderSeats[index + 1], this.reorderSeats[index]];
  }

  savePriority(): void {
    if (!this.reorderingId) return;
    const seatIds = this.reorderSeats.map(s => s.id);
    this.dashboardService.updateTransportPriority(this.reorderingId, seatIds).subscribe({
      next: () => {
        this.toast.success('Prioridades actualizadas.');
        this.reorderingId = null;
        this.reorderSeats = [];
        this.loadTransports();
      },
      error: (err) => this.toast.error(err.error?.message || 'Error al actualizar prioridades.'),
    });
  }

  // ─── Helpers ───

  seatProgress(t: Transport): number {
    return t.totalSeats > 0 ? ((t.occupiedSeats || 0) / t.totalSeats) * 100 : 0;
  }
}
