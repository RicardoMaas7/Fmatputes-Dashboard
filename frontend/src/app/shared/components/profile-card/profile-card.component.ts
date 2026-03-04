import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-profile-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="profile-wrapper animate-fade-in">
      <!-- Photo -->
      <div class="photo-container">
        <img
          [src]="resolvedPhotoUrl || defaultAvatar"
          [alt]="displayName"
          class="photo"
          (error)="onImgError($event)"
        />
        <div class="scanlines"></div>
      </div>

      <!-- Name -->
      <h3 class="username">{{ displayName || 'USUARIO' }}</h3>

      <!-- Birthday -->
      <div *ngIf="birthday" class="birthday-row">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
        <span>{{ birthday }}</span>
      </div>
    </div>
  `,
  styles: [`
    .profile-wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 1.5rem 1.25rem;
      background: rgba(14, 14, 22, 0.65);
      border: 1px solid rgba(57, 255, 20, 0.06);
      border-radius: 8px;
      backdrop-filter: blur(10px);
    }
    .photo-container {
      position: relative;
      width: 100%;
      max-width: 180px;
      aspect-ratio: 1;
      overflow: hidden;
      border: 1px solid rgba(57, 255, 20, 0.12);
      border-radius: 8px;
    }
    .photo {
      width: 100%;
      height: 100%;
      object-fit: cover;
      filter: grayscale(100%) brightness(0.7) sepia(100%) hue-rotate(70deg) saturate(400%) contrast(1.1);
    }
    .scanlines {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: repeating-linear-gradient(
        0deg,
        rgba(0,0,0,0.08) 0px,
        rgba(0,0,0,0.08) 1px,
        transparent 1px,
        transparent 3px
      );
      pointer-events: none;
    }
    .username {
      margin-top: 1rem;
      font-family: 'Inter', sans-serif;
      font-size: 15px;
      font-weight: 700;
      letter-spacing: 0.04em;
      color: #39ff14;
    }
    .birthday-row {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      margin-top: 0.5rem;
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      color: rgba(57, 255, 20, 0.35);
    }
  `],
})
export class ProfileCardComponent {
  @Input() displayName = '';
  @Input() photoUrl = '';
  @Input() birthday = '';
  defaultAvatar = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Crect fill='%230e0e14' width='200' height='200'/%3E%3Ctext fill='%2339ff14' font-family='monospace' font-size='60' x='50%25' y='55%25' text-anchor='middle'%3E%3F%3C/text%3E%3C/svg%3E";

  get resolvedPhotoUrl(): string {
    if (!this.photoUrl) return '';
    if (this.photoUrl.startsWith('/uploads/')) {
      return environment.apiUrl.replace('/api', '') + this.photoUrl;
    }
    return this.photoUrl;
  }

  onImgError(event: Event): void {
    (event.target as HTMLImageElement).src = this.defaultAvatar;
  }
}
