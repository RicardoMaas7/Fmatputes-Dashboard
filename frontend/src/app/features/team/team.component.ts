import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DashboardService } from '../../shared/services/dashboard.service';

@Component({
  selector: 'app-team',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="team-container p-4 animate-fade-in">
      <h2 class="page-title">Equipo</h2>
      <p class="page-subtitle">Miembros del grupo</p>

      <!-- Loading -->
      <div *ngIf="isLoading" class="flex items-center justify-center py-20">
        <div class="w-10 h-10 border-2 border-wired-neon border-t-transparent rounded-full animate-spin"></div>
      </div>

      <!-- Members Grid -->
      <div *ngIf="!isLoading" class="members-grid">
        <div
          *ngFor="let member of members"
          class="member-card"
          (click)="viewProfile(member.id)"
        >
          <div class="member-photo-wrap">
            <img
              [src]="member.profilePhotoUrl || defaultAvatar"
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

      <div *ngIf="!isLoading && members.length === 0" class="empty-state">
        No hay miembros registrados.
      </div>
    </div>
  `,
  styles: [`
    .team-container {
      max-width: 800px;
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
  members: any[] = [];
  isLoading = true;
  defaultAvatar = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Crect fill='%230e0e14' width='200' height='200'/%3E%3Ctext fill='%2339ff14' font-family='monospace' font-size='60' x='50%25' y='55%25' text-anchor='middle'%3E%3F%3C/text%3E%3C/svg%3E";

  constructor(private dashboardService: DashboardService, private router: Router) {}

  ngOnInit(): void {
    this.dashboardService.getAllUsers().subscribe({
      next: (users) => {
        this.members = users;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  viewProfile(userId: string): void {
    this.router.navigate(['/member', userId]);
  }

  onImgError(event: Event): void {
    (event.target as HTMLImageElement).src = this.defaultAvatar;
  }
}
