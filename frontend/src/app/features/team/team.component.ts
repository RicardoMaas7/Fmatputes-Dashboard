import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DashboardService } from '../../shared/services/dashboard.service';
import { AuthService } from '../../shared/services/auth.service';
import { ToastService } from '../../shared/services/toast.service';
import { ConfirmModalService } from '../../shared/services/confirm-modal.service';
import { User, Team } from '../../shared/models';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-team',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="team-container p-4 animate-fade-in">
      <h2 class="page-title"><span class="text-wired-amber">&gt;</span> Equipo</h2>
      <p class="page-subtitle">Equipos y miembros del grupo</p>

      <!-- Loading -->
      <div *ngIf="isLoading" class="flex items-center justify-center py-20">
        <div class="w-10 h-10 border-2 border-wired-neon border-t-transparent rounded-full animate-spin"></div>
      </div>

      <!-- ===== TEAMS SECTION ===== -->
      <div *ngIf="!isLoading" class="mb-8">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm text-wired-amber uppercase tracking-wider font-bold">Equipos</h3>
          <button (click)="openTeamForm()" class="neon-btn text-[10px] px-3 py-1.5 flex items-center gap-1.5">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            NUEVO EQUIPO
          </button>
        </div>

        <!-- Team Create/Edit Form -->
        <div *ngIf="showTeamForm" class="neon-card p-4 mb-4 animate-fade-in">
          <h4 class="text-xs text-wired-neon uppercase tracking-wider mb-3">
            {{ editingTeamId ? 'Editar Equipo' : 'Nuevo Equipo' }}
          </h4>
          <div class="mb-3">
            <label class="text-[10px] text-wired-dim-light uppercase tracking-wider block mb-1">Nombre del equipo</label>
            <input [(ngModel)]="teamForm.name" class="neon-input text-sm w-full" placeholder="Ej: Los cracks" />
          </div>
          <div class="mb-3">
            <label class="text-[10px] text-wired-dim-light uppercase tracking-wider block mb-1">Integrantes</label>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-48 overflow-y-auto p-1">
              <label *ngFor="let user of allUsers"
                     class="flex items-center gap-2 p-1.5 rounded cursor-pointer transition-colors text-xs"
                     [class.bg-wired-neon]="teamForm.memberIds.includes(user.id)"
                     [class.bg-opacity-10]="teamForm.memberIds.includes(user.id)"
                     [class.text-wired-neon]="teamForm.memberIds.includes(user.id)"
                     [class.text-wired-dim-light]="!teamForm.memberIds.includes(user.id)"
                     [class.hover:bg-wired-dim]="!teamForm.memberIds.includes(user.id)">
                <input type="checkbox" [checked]="teamForm.memberIds.includes(user.id)"
                       (change)="toggleMember(user.id)" class="hidden" />
                <div class="w-5 h-5 rounded-full overflow-hidden border border-wired-dim flex-shrink-0">
                  <img [src]="resolvePhoto(user.profilePhotoUrl)" class="w-full h-full object-cover" (error)="onImgError($event)" />
                </div>
                {{ user.displayName || user.username }}
              </label>
            </div>
          </div>
          <div class="flex gap-2">
            <button (click)="saveTeam()" [disabled]="savingTeam" class="neon-btn text-[10px] px-4 py-1.5" [class.opacity-50]="savingTeam">
              {{ savingTeam ? 'GUARDANDO...' : (editingTeamId ? 'ACTUALIZAR' : 'CREAR') }}
            </button>
            <button (click)="closeTeamForm()" class="text-[10px] text-wired-dim-light hover:text-white px-3">CANCELAR</button>
          </div>
        </div>

        <!-- Team Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div *ngFor="let team of teams" class="team-card">
            <div class="flex items-center justify-between mb-2">
              <h4 class="text-sm font-bold text-white">{{ team.name }}</h4>
              <div *ngIf="canEditTeam(team)" class="flex items-center gap-1">
                <button (click)="editTeam(team)" class="text-wired-dim-light hover:text-wired-neon transition-colors p-0.5" title="Editar">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </button>
                <button (click)="deleteTeam(team)" class="text-red-500/30 hover:text-red-400 transition-colors p-0.5" title="Eliminar">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            </div>
            <div class="text-[9px] text-wired-dim-light mb-2 font-mono">
              Creado por {{ team.creator?.displayName || team.creator?.username || '—' }} · {{ team.members?.length || 0 }} miembros
            </div>
            <div class="flex flex-wrap gap-1.5">
              <div *ngFor="let m of team.members"
                   class="flex items-center gap-1 bg-wired-dim/30 rounded-full pl-0.5 pr-2 py-0.5 cursor-pointer hover:bg-wired-dim/50 transition-colors"
                   (click)="viewProfile(m.user?.id || m.userId)">
                <div class="w-5 h-5 rounded-full overflow-hidden border border-wired-dim/50">
                  <img [src]="resolvePhoto(m.user?.profilePhotoUrl)" class="w-full h-full object-cover" (error)="onImgError($event)" />
                </div>
                <span class="text-[10px] text-white">{{ m.user?.displayName || m.user?.username || '?' }}</span>
              </div>
            </div>
          </div>
        </div>

        <div *ngIf="teams.length === 0 && !showTeamForm" class="text-center text-wired-dim-light text-[10px] p-6 border border-dashed border-wired-dim/20 rounded-lg">
          No hay equipos creados. ¡Crea el primero!
        </div>
      </div>

      <!-- ===== MEMBERS DIRECTORY ===== -->
      <div *ngIf="!isLoading">
        <h3 class="text-sm text-wired-amber uppercase tracking-wider font-bold mb-4">Directorio</h3>
        <div class="members-grid">
          <div
            *ngFor="let member of members"
            class="member-card"
            (click)="viewProfile(member.id)"
          >
            <div class="member-photo-wrap">
              <img
                [src]="resolvePhoto(member.profilePhotoUrl)"
                [alt]="member.displayName"
                class="member-photo"
                (error)="onImgError($event)"
              />
              <div class="photo-overlay"></div>
            </div>
            <div class="member-info">
              <h3 class="member-name">{{ member.displayName }}</h3>
              <span class="member-role" [class.admin]="member.role === 'admin'">
                {{ member.role === 'admin' ? 'Admin' : 'Miembro' }}
              </span>
            </div>
            <div class="member-arrow">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </div>
          </div>
        </div>

        <div *ngIf="members.length === 0" class="empty-state">
          No hay miembros registrados.
        </div>
      </div>
    </div>
  `,
  styles: [`
    .team-container {
      max-width: 900px;
      margin: 0 auto;
    }
    .page-title {
      font-family: 'Inter', sans-serif;
      font-size: 20px;
      font-weight: 700;
      color: #39ff14;
      margin: 0;
    }
    .page-subtitle {
      font-family: 'Inter', sans-serif;
      font-size: 12px;
      color: rgba(57, 255, 20, 0.35);
      margin-top: 4px;
      margin-bottom: 1.5rem;
    }
    .team-card {
      background: rgba(14, 14, 22, 0.6);
      border: 1px solid rgba(57, 255, 20, 0.08);
      border-radius: 10px;
      padding: 1rem;
      transition: border-color 0.25s;
    }
    .team-card:hover {
      border-color: rgba(57, 255, 20, 0.18);
    }
    .members-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 0.75rem;
    }
    .member-card {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      background: rgba(14, 14, 22, 0.65);
      border: 1px solid rgba(57, 255, 20, 0.06);
      border-radius: 8px;
      backdrop-filter: blur(6px);
      cursor: pointer;
      transition: all 0.25s cubic-bezier(.4,0,.2,1);
    }
    .member-card:hover {
      border-color: rgba(57, 255, 20, 0.18);
      background: rgba(14, 14, 22, 0.85);
      transform: translateY(-1px);
    }
    .member-photo-wrap {
      position: relative;
      width: 48px;
      height: 48px;
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid rgba(57, 255, 20, 0.1);
      flex-shrink: 0;
    }
    .member-photo {
      width: 100%;
      height: 100%;
      object-fit: cover;
      filter: grayscale(100%) brightness(0.7) sepia(100%) hue-rotate(70deg) saturate(400%) contrast(1.1);
    }
    .photo-overlay {
      position: absolute;
      inset: 0;
      background: repeating-linear-gradient(
        0deg,
        rgba(0,0,0,0.06) 0px,
        rgba(0,0,0,0.06) 1px,
        transparent 1px,
        transparent 3px
      );
      pointer-events: none;
    }
    .member-info {
      flex: 1;
      min-width: 0;
    }
    .member-name {
      font-family: 'Inter', sans-serif;
      font-size: 14px;
      font-weight: 600;
      color: white;
      margin: 0;
    }
    .member-role {
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      color: rgba(57, 255, 20, 0.35);
      text-transform: uppercase;
      letter-spacing: 0.1em;
    }
    .member-role.admin {
      color: #ffbf00;
    }
    .member-arrow {
      color: rgba(57, 255, 20, 0.2);
      transition: color 0.2s;
    }
    .member-card:hover .member-arrow {
      color: rgba(57, 255, 20, 0.6);
    }
    .empty-state {
      text-align: center;
      font-family: 'Inter', sans-serif;
      font-size: 12px;
      color: rgba(57, 255, 20, 0.25);
      padding: 3rem;
      border: 1px dashed rgba(57, 255, 20, 0.08);
      border-radius: 8px;
    }
  `],
})
export class TeamComponent implements OnInit {
  members: User[] = [];
  allUsers: User[] = [];
  teams: Team[] = [];
  isLoading = true;
  defaultAvatar = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Crect fill='%230e0e14' width='200' height='200'/%3E%3Ctext fill='%2339ff14' font-family='monospace' font-size='60' x='50%25' y='55%25' text-anchor='middle'%3E%3F%3C/text%3E%3C/svg%3E";

  // Team form
  showTeamForm = false;
  editingTeamId: string | null = null;
  savingTeam = false;
  teamForm = { name: '', memberIds: [] as string[] };

  constructor(
    private dashboardService: DashboardService,
    private authService: AuthService,
    private router: Router,
    private toast: ToastService,
    private confirmModal: ConfirmModalService,
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  get currentUserId(): string {
    return this.authService.getCurrentUser()?.id || '';
  }

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  loadData(): void {
    this.isLoading = true;
    this.dashboardService.getAllUsers().subscribe({
      next: (users) => {
        this.members = users;
        this.allUsers = users;
        this.dashboardService.getTeams().subscribe({
          next: (teams) => {
            this.teams = teams;
            this.isLoading = false;
          },
          error: () => {
            this.isLoading = false;
          },
        });
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  viewProfile(userId: string | undefined): void {
    if (userId) this.router.navigate(['/member', userId]);
  }

  resolvePhoto(url: string | null | undefined): string {
    if (!url) return this.defaultAvatar;
    if (url.startsWith('/uploads/')) {
      return environment.apiUrl.replace('/api', '') + url;
    }
    return url;
  }

  onImgError(event: Event): void {
    (event.target as HTMLImageElement).src = this.defaultAvatar;
  }

  // ─── Team CRUD ───
  canEditTeam(team: Team): boolean {
    return team.createdBy === this.currentUserId || this.isAdmin;
  }

  openTeamForm(): void {
    this.editingTeamId = null;
    this.teamForm = { name: '', memberIds: [this.currentUserId] };
    this.showTeamForm = true;
  }

  editTeam(team: Team): void {
    this.editingTeamId = team.id;
    this.teamForm = {
      name: team.name,
      memberIds: team.members?.map(m => m.userId) || [],
    };
    this.showTeamForm = true;
  }

  closeTeamForm(): void {
    this.showTeamForm = false;
    this.editingTeamId = null;
  }

  toggleMember(userId: string): void {
    const idx = this.teamForm.memberIds.indexOf(userId);
    if (idx > -1) {
      this.teamForm.memberIds.splice(idx, 1);
    } else {
      this.teamForm.memberIds.push(userId);
    }
  }

  saveTeam(): void {
    if (!this.teamForm.name) {
      this.toast.show('El nombre es requerido', 'error');
      return;
    }
    this.savingTeam = true;
    const obs = this.editingTeamId
      ? this.dashboardService.updateTeam(this.editingTeamId, this.teamForm)
      : this.dashboardService.createTeam(this.teamForm);

    obs.subscribe({
      next: () => {
        this.savingTeam = false;
        this.closeTeamForm();
        this.loadData();
        this.toast.show(this.editingTeamId ? 'Equipo actualizado' : 'Equipo creado', 'success');
      },
      error: (e) => {
        this.savingTeam = false;
        this.toast.show(e.error?.message || 'Error al guardar', 'error');
      },
    });
  }

  async deleteTeam(team: Team): Promise<void> {
    const ok = await this.confirmModal.confirm('Eliminar equipo', `¿Eliminar "${team.name}"?`, { type: 'danger' });
    if (!ok) return;
    this.dashboardService.deleteTeam(team.id).subscribe({
      next: () => {
        this.loadData();
        this.toast.show('Equipo eliminado', 'success');
      },
      error: (e) => this.toast.show(e.error?.message || 'Error', 'error'),
    });
  }
}
