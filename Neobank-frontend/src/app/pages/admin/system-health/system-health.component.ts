import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef, effect } from '@angular/core';
import { AdminDashboardService, SystemHealth } from '../../../services/admin-dashboard.service';
import { ThemeService } from '../../../services/theme.service';

@Component({
  selector: 'app-system-health',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="health" [class.dark-mode]="isDarkMode">
      <div class="title-row">
        <div>
          <h2>System Health</h2>
          <p>Live monitoring from the banking backend.</p>
        </div>
        <button (click)="load()">Refresh</button>
      </div>
      <div class="health-grid" *ngIf="health">
        <article>
          <span>Database</span
          ><strong
            [class.up]="health.databaseStatus === 'UP'"
            [class.down]="health.databaseStatus !== 'UP'"
            >{{ health.databaseStatus }}</strong
          >
        </article>
        <article>
          <span>Application</span
          ><strong
            [class.up]="health.applicationHealth === 'UP'"
            [class.down]="health.applicationHealth !== 'UP'"
            >{{ health.applicationHealth }}</strong
          >
        </article>
        <article>
          <span>Active Sessions</span><strong>{{ health.activeSessionCount }}</strong>
        </article>
        <article>
          <span>Uptime</span><strong>{{ health.serverUptime }}</strong>
        </article>
      </div>
    </section>
  `,
  styles: [
    `
      .health {
        padding: 2rem;
        color: #1f2937;
        background: #ffffff;
      }
      .health.dark-mode {
        color: #f8fafc;
        background: transparent;
      }
      .title-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
      }
      h2,
      p {
        margin: 0;
      }
      h2 {
        color: #111827;
      }
      .health.dark-mode h2 {
        color: #f1f5f9;
      }
      p {
        color: #6b7280;
        margin-top: 0.35rem;
      }
      .health.dark-mode p {
        color: #a8bddf;
      }
      button {
        background: #3b82f6;
        color: white;
        border: 0;
        border-radius: 8px;
        padding: 0.7rem 1rem;
        font-weight: 700;
        cursor: pointer;
      }
      .health-grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 1rem;
      }
      article {
        background: #f9fafb;
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        padding: 1.25rem;
        min-height: 130px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }
      .health.dark-mode article {
        background: rgba(22, 33, 62, 0.94);
        border-color: rgba(96, 165, 250, 0.14);
      }
      span {
        color: #6b7280;
      }
      .health.dark-mode span {
        color: #a8bddf;
      }
      strong {
        font-size: 1.7rem;
        color: #1f2937;
      }
      .health.dark-mode strong {
        color: #f8fafc;
      }
      .up {
        color: #34d399;
      }
      .down {
        color: #f87171;
      }
      @media (max-width: 900px) {
        .health {
          padding: 1rem;
        }
        .title-row {
          align-items: stretch;
          flex-direction: column;
          gap: 0.9rem;
        }
        button {
          width: 100%;
          min-height: 46px;
        }
        .health-grid {
          grid-template-columns: 1fr;
        }
      }
      @media (max-width: 420px) {
        .health {
          padding: 0.875rem;
        }
        h2 {
          font-size: 1.35rem;
        }
      }
    `,
  ],
})
export class SystemHealthComponent implements OnInit {
  health: SystemHealth | null = null;
  isDarkMode = false;

  constructor(
    private service: AdminDashboardService,
    private cdr: ChangeDetectorRef,
    private themeService: ThemeService,
  ) {
    effect(() => {
      this.isDarkMode = this.themeService.isDarkMode();
      this.cdr.detectChanges();
    });
  }
  ngOnInit(): void {
    this.load();
  }
  load(): void {
    this.service.getSystemHealth().subscribe((data) => {
      this.health = data;
      this.cdr.detectChanges();
    });
  }
}
