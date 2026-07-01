import { CommonModule } from '@angular/common';

import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  effect,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';

import { FormsModule } from '@angular/forms';

import { Chart, registerables } from 'chart.js';

import {
  AdminDashboardService,
  PageResponse,
  SystemAuditLog,
} from '../../../services/admin-dashboard.service';

import { ThemeService } from '../../../services/theme.service';

Chart.register(...registerables);

@Component({
  selector: 'app-system-logs',

  standalone: true,

  imports: [CommonModule, FormsModule],

  changeDetection: ChangeDetectionStrategy.OnPush,

  template: `
    <section class="logs-shell">
      <div class="title-row">
        <div>
          <h2>System Audit Logs</h2>

          <p>Operational request history, response timing, and error monitoring.</p>
        </div>

        <button class="primary-btn" (click)="exportCsv()" [disabled]="logs.length === 0">
          Export CSV
        </button>
      </div>

      <div class="filters">
        <input [(ngModel)]="search" placeholder="Search event, endpoint, user" />

        <input [(ngModel)]="endpoint" placeholder="Endpoint filter" />

        <input [(ngModel)]="username" placeholder="User filter" />

        <input [(ngModel)]="from" type="datetime-local" />

        <input [(ngModel)]="to" type="datetime-local" />

        <button class="primary-btn" (click)="load(0)">Apply</button>
      </div>

      <div class="chart-grid">
        <div class="panel">
          <h3>Error Rate</h3>
          <canvas #errorChart></canvas>
        </div>

        <div class="panel">
          <h3>Response Time</h3>
          <canvas #responseChart></canvas>
        </div>
      </div>

      <div class="panel table-panel">
        <div class="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Time</th>

                <th>Method</th>

                <th>Endpoint</th>

                <th>Status</th>

                <th>Time ms</th>

                <th>User</th>

                <th>Event</th>

                <th>Error</th>
              </tr>
            </thead>

            <tbody>
              <tr *ngFor="let log of logs">
                <td>{{ log.eventTimestamp | date: 'short' }}</td>

                <td>{{ log.httpMethod }}</td>

                <td class="endpoint">{{ log.endpoint }}</td>

                <td>
                  <span class="status" [class.error]="log.responseStatus >= 400">{{
                    log.responseStatus
                  }}</span>
                </td>

                <td>{{ log.executionTimeMs }}</td>

                <td>{{ log.actingUsername || 'Anonymous' }}</td>

                <td>{{ log.eventType }}</td>

                <td>{{ log.errorMessage || '-' }}</td>
              </tr>

              <tr *ngIf="!loading && logs.length === 0">
                <td colspan="8" class="empty">No logs found</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="pager">
          <button (click)="load(page - 1)" [disabled]="page === 0 || loading">Previous</button>

          <span>Page {{ page + 1 }} of {{ totalPages || 1 }}</span>

          <button (click)="load(page + 1)" [disabled]="page + 1 >= totalPages || loading">
            Next
          </button>
        </div>
      </div>
    </section>
  `,

  styles: [
    `
      .logs-shell {
        padding: clamp(1rem, 2vw, 2rem);
        color: #0f172a;
        min-width: 0;
      }

      :host-context(.dark-mode) .logs-shell {
        color: #f8fafc;
      }

      .title-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1rem;
        margin-bottom: 1rem;
      }

      h2,
      h3,
      p {
        margin: 0;
      }
      p {
        color: #64748b;
        margin-top: 0.35rem;
      }

      :host-context(.dark-mode) p {
        color: #a8bddf;
      }

      .filters {
        display: grid;
        grid-template-columns: repeat(6, minmax(0, 1fr));
        gap: 0.75rem;
        margin-bottom: 1rem;
      }

      input {
        width: 100%;
        min-height: 44px;
        border: 1px solid #cbd5e1;
        border-radius: 8px;
        padding: 0.65rem 0.8rem;
        background: #fff;
        color: #0f172a;
      }

      :host-context(.dark-mode) input {
        background: #0f172a;
        color: #e5e7eb;
        border-color: #334155;
      }

      .primary-btn,
      .pager button {
        min-height: 44px;
        border: 0;
        border-radius: 8px;
        padding: 0.65rem 1rem;
        background: #2563eb;
        color: white;
        font-weight: 700;
        cursor: pointer;
      }

      button:disabled {
        opacity: 0.55;
        cursor: not-allowed;
      }

      .chart-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 1rem;
        margin-bottom: 1rem;
      }

      .panel {
        background: #fff;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 1rem;
        box-shadow: 0 12px 30px rgba(15, 23, 42, 0.08);
        min-width: 0;
      }

      :host-context(.dark-mode) .panel {
        background: rgba(22, 33, 62, 0.94);
        border-color: rgba(96, 165, 250, 0.16);
      }

      canvas {
        width: 100% !important;
        height: 240px !important;
        margin-top: 1rem;
      }

      .table-scroll {
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
      }

      table {
        width: 100%;
        min-width: 920px;
        border-collapse: collapse;
      }

      th,
      td {
        padding: 0.75rem;
        border-bottom: 1px solid #e2e8f0;
        text-align: left;
        vertical-align: top;
      }

      :host-context(.dark-mode) th,
      :host-context(.dark-mode) td {
        border-color: rgba(148, 163, 184, 0.18);
      }

      th {
        color: #475569;
        font-size: 0.82rem;
        text-transform: uppercase;
      }

      :host-context(.dark-mode) th {
        color: #cbd5e1;
      }

      .endpoint {
        max-width: 280px;
        overflow-wrap: anywhere;
      }

      .status {
        padding: 0.25rem 0.55rem;
        border-radius: 999px;
        background: #dcfce7;
        color: #047857;
        font-weight: 800;
      }

      .status.error {
        background: #fee2e2;
        color: #dc2626;
      }

      .empty {
        text-align: center;
        color: #64748b;
        padding: 2rem;
      }

      .pager {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1rem;
        margin-top: 1rem;
      }

      @media (max-width: 1024px) {
        .filters {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }

      @media (max-width: 768px) {
        .title-row,
        .chart-grid,
        .filters {
          grid-template-columns: 1fr;
          display: grid;
          align-items: stretch;
        }

        .primary-btn {
          width: 100%;
        }

        .pager {
          flex-direction: column;
          align-items: stretch;
        }

        canvas {
          height: 210px !important;
        }
      }
    `,
  ],
})
export class SystemLogsComponent implements OnInit, OnDestroy {
  @ViewChild('errorChart') errorChartRef?: ElementRef<HTMLCanvasElement>;

  @ViewChild('responseChart') responseChartRef?: ElementRef<HTMLCanvasElement>;

  logs: SystemAuditLog[] = [];

  page = 0;

  totalPages = 0;

  loading = false;

  search = '';

  endpoint = '';

  username = '';

  from = '';

  to = '';

  private charts: Chart[] = [];

  constructor(
    private service: AdminDashboardService,
    private themeService: ThemeService,
    private cdr: ChangeDetectorRef,
  ) {
    effect(() => {
      this.themeService.isDarkMode();

      this.renderCharts();

      this.cdr.markForCheck();
    });
  }

  ngOnInit(): void {
    this.load(0);
  }

  ngOnDestroy(): void {
    this.charts.forEach((chart) => chart.destroy());
  }

  load(page: number): void {
    if (page < 0) return;

    this.loading = true;

    this.cdr.detectChanges();

    this.service
      .getSystemLogs({
        search: this.search,

        endpoint: this.endpoint,

        username: this.username,

        from: this.toIso(this.from),

        to: this.toIso(this.to),

        page,

        size: 20,
      })
      .subscribe({
        next: (response: PageResponse<SystemAuditLog>) => {
          this.logs = response.content;

          this.page = response.number;

          this.totalPages = response.totalPages;

          this.loading = false;

          this.cdr.detectChanges(); // instantly refresh table

          requestAnimationFrame(() => {
            this.renderCharts();

            this.cdr.markForCheck();
          });
        },

        error: () => {
          this.loading = false;

          this.logs = [];

          this.cdr.detectChanges();

          requestAnimationFrame(() => {
            this.renderCharts();

            this.cdr.markForCheck();
          });
        },
      });
  }

  exportCsv(): void {
    const rows = [
      ['Time', 'Method', 'Endpoint', 'Status', 'TimeMs', 'User', 'Event', 'Error'],

      ...this.logs.map((log) => [
        log.eventTimestamp,

        log.httpMethod,

        log.endpoint,

        String(log.responseStatus),

        String(log.executionTimeMs),

        log.actingUsername || '',

        log.eventType,

        log.errorMessage || '',
      ]),
    ];

    const csv = rows
      .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });

    const link = document.createElement('a');

    link.href = URL.createObjectURL(blob);

    link.download = 'system-audit-logs.csv';

    link.click();

    URL.revokeObjectURL(link.href);
  }

  private renderCharts(): void {
    this.charts.forEach((chart) => chart.destroy());

    this.charts = [];

    this.addChart(this.errorChartRef, {
      type: 'doughnut',

      data: {
        labels: ['Success', 'Errors'],

        datasets: [
          {
            data: [
              this.logs.filter((l) => l.responseStatus < 400).length,
              this.logs.filter((l) => l.responseStatus >= 400).length,
            ],
            backgroundColor: ['#10b981', '#ef4444'],
          },
        ],
      },

      options: this.chartOptions('doughnut'),
    });

    this.addChart(this.responseChartRef, {
      type: 'bar',

      data: {
        labels: this.logs.slice(0, 10).map((log) => log.eventType),

        datasets: [
          {
            label: 'Response ms',
            data: this.logs.slice(0, 10).map((log) => log.executionTimeMs),
            backgroundColor: '#3b82f6',
          },
        ],
      },

      options: this.chartOptions(),
    });
  }

  private addChart(ref: ElementRef<HTMLCanvasElement> | undefined, config: any): void {
    if (!ref?.nativeElement) return;

    this.charts.push(new Chart(ref.nativeElement, config));
  }

  private chartOptions(type?: string): any {
    const dark = this.themeService.isDarkMode();

    const color = dark ? '#dbeafe' : '#334155';

    const grid = dark ? 'rgba(148,163,184,.18)' : 'rgba(100,116,139,.18)';

    return {
      responsive: true,

      maintainAspectRatio: false,

      plugins: { legend: { labels: { color, usePointStyle: true } } },

      ...(type !== 'doughnut' && {
        scales: {
          x: { ticks: { color }, grid: { color: grid } },
          y: { ticks: { color }, grid: { color: grid }, beginAtZero: true },
        },
      }),
    };
  }

  private toIso(value: string): string | undefined {
    return value ? new Date(value).toISOString().slice(0, 19) : undefined;
  }
}
