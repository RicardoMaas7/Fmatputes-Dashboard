import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-radar-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="radar-wrapper animate-fade-in">
      <!-- Radar SVG -->
      <div class="radar-viewport">
        <div *ngIf="safeSvg" [innerHTML]="safeSvg" class="radar-container"></div>
        
        <!-- Loading state -->
        <div *ngIf="!safeSvg && isLoading" class="empty-state">
          <div class="w-8 h-8 border border-wired-neon border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p class="text-xs uppercase tracking-widest opacity-60">Generando...</p>
        </div>

        <!-- No data state -->
        <div *ngIf="!safeSvg && !isLoading" class="empty-state">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#39ff14" stroke-width="1" opacity="0.3" class="mx-auto mb-2">
            <polygon points="12,2 22,8.5 22,15.5 12,22 2,15.5 2,8.5"/>
            <line x1="12" y1="2" x2="12" y2="22"/><line x1="2" y1="8.5" x2="22" y2="15.5"/><line x1="22" y1="8.5" x2="2" y2="15.5"/>
          </svg>
          <p class="text-xs opacity-40">Sin datos de radar</p>
        </div>
      </div>

      <!-- Stats bar -->
      <div *ngIf="stats" class="stats-bar">
        <div *ngFor="let stat of statEntries" class="stat-cell">
          <span class="stat-label">{{ stat.label }}</span>
          <span class="stat-value">{{ stat.value }}</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .radar-wrapper {
      background: rgba(14, 14, 22, 0.5);
      border: 1px solid rgba(57, 255, 20, 0.06);
      border-radius: 8px;
      backdrop-filter: blur(6px);
      overflow: hidden;
    }
    .radar-viewport {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      min-height: 280px;
    }
    @media (max-width: 480px) {
      .radar-viewport {
        padding: 0.5rem;
        min-height: 240px;
      }
    }
    .radar-container {
      width: 100%;
      max-width: 380px;
      margin: 0 auto;
    }
    :host ::ng-deep .radar-container svg {
      width: 100%;
      height: auto;
      display: block;
    }
    .empty-state {
      text-align: center;
      padding: 2rem;
    }
    .stats-bar {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      border-top: 1px solid rgba(57, 255, 20, 0.06);
      background: rgba(14, 14, 22, 0.6);
    }
    @media (max-width: 360px) {
      .stats-bar {
        grid-template-columns: repeat(3, 1fr);
      }
    }
    .stat-cell {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 0.5rem 0.25rem;
      border-right: 1px solid rgba(57, 255, 20, 0.06);
    }
    .stat-cell:last-child { border-right: none; }
    .stat-label {
      font-family: 'Inter', sans-serif;
      font-size: 9px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: rgba(57, 255, 20, 0.35);
    }
    .stat-value {
      font-family: 'JetBrains Mono', monospace;
      font-size: 14px;
      font-weight: 700;
      color: #39ff14;
      margin-top: 2px;
    }
  `],
})
export class RadarChartComponent implements OnChanges {
  @Input() svgContent = '';
  @Input() userName = '';
  @Input() stats: Record<string, number> | null = null;
  @Input() isLoading = false;

  safeSvg: SafeHtml | null = null;
  statEntries: { label: string; value: string }[] = [];

  private labelMap: Record<string, string> = {
    mathematics: 'MATH',
    programming: 'CODE',
    teamwork: 'TEAM',
    discipline: 'DISC',
    sociability: 'SOC',
  };

  constructor(private sanitizer: DomSanitizer) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['svgContent']) {
      this.safeSvg = this.svgContent
        ? this.sanitizer.bypassSecurityTrustHtml(this.svgContent)
        : null;
    }
    if (changes['stats'] && this.stats) {
      this.statEntries = Object.entries(this.stats).map(([key, value]) => ({
        label: this.labelMap[key] || key,
        value: typeof value === 'number' ? value.toFixed(1) : String(value),
      }));
    }
  }
}
