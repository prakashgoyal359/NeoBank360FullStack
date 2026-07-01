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

import { Chart, registerables } from 'chart.js';

import {
  AdminAdvancedAnalytics,
  AdminDashboardService,
  AdminDashboardStats,
} from '../../../services/admin-dashboard.service';

import { ThemeService } from '../../../services/theme.service';

import { forkJoin } from 'rxjs';

Chart.register(...registerables);

@Component({
  selector: 'app-admin-dashboard',

  standalone: true,

  imports: [CommonModule],

  changeDetection: ChangeDetectionStrategy.OnPush,

  template: `
    <section class="admin-analytics">
      <div class="title-row">
        <div>
          <h2>Executive Analytics</h2>

          <p>Transaction analytics, loan analytics, and derived system audit activity.</p>
        </div>

        <div class="actions">
          <div class="period-toggle" aria-label="Analytics period">
            <button
              *ngFor="let item of periods"
              [class.active]="period === item"
              (click)="setPeriod(item)"
            >
              {{ item }}
            </button>
          </div>

          <button class="refresh-btn" (click)="load()" [disabled]="loading">
            {{ loading ? 'Loading...' : 'Refresh' }}
          </button>
        </div>
      </div>

      <div class="error-card" *ngIf="errorMessage">{{ errorMessage }}</div>

      <div class="kpi-grid">
        <div class="kpi">
          <span>Total Users</span><strong>{{ stats?.totalUsers || 0 }}</strong>
        </div>

        <div class="kpi">
          <span>Active Users</span><strong>{{ stats?.totalActiveUsers || 0 }}</strong>
        </div>

        <div class="kpi">
          <span>Transactions</span
          ><strong>{{ advanced?.transactionVolume || stats?.totalTransactions || 0 }}</strong>
        </div>

        <div class="kpi">
          <span>Credit Volume</span><strong>Rs {{ advanced?.creditAmount || 0 | number }}</strong>
        </div>

        <div class="kpi warning">
          <span>Debit Volume</span><strong>Rs {{ advanced?.debitAmount || 0 | number }}</strong>
        </div>

        <div class="kpi">
          <span>Savings Rate</span><strong>{{ stats?.platformSavingsRate || 0 }}%</strong>
        </div>
      </div>

      <div class="kpi-grid loan-grid">
        <div class="kpi loan">
          <span>Total Disbursed</span
          ><strong>Rs {{ advanced?.totalDisbursed || 0 | number }}</strong>
        </div>

        <div class="kpi warning">
          <span>Outstanding Principal</span
          ><strong>Rs {{ advanced?.outstandingPrincipal || 0 | number }}</strong>
        </div>

        <div class="kpi audit">
          <span>Derived Audit Events</span><strong>{{ advanced?.auditEvents || 0 }}</strong>
        </div>
      </div>

      <div class="charts-grid">
        <div class="chart-panel wide">
          <h3>{{ period }} Transaction Trend</h3>

          <canvas #transactionTrendChart></canvas>
        </div>

        <div class="chart-panel">
          <h3>Transaction Category Analytics</h3>

          <canvas #categoryChart></canvas>
        </div>

        <div class="chart-panel">
          <h3>Loan Analytics</h3>

          <canvas #loanChart></canvas>
        </div>
      </div>
    </section>
  `,

  styles: [
    `
      .admin-analytics {
        padding: clamp(1rem, 2vw, 2rem);

        color: #0f172a;

        min-width: 0;
      }

      :host-context(.dark-mode) .admin-analytics {
        color: #f8fafc;
      }

      .title-row {
        display: flex;

        justify-content: space-between;

        align-items: center;

        gap: 1rem;

        margin-bottom: 1.5rem;
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

      .actions {
        display: flex;

        align-items: center;

        gap: 0.75rem;

        flex-wrap: wrap;

        justify-content: flex-end;
      }

      .period-toggle {
        display: inline-flex;

        padding: 0.25rem;

        border-radius: 10px;

        background: #e2e8f0;

        gap: 0.25rem;
      }

      :host-context(.dark-mode) .period-toggle {
        background: #0f172a;
      }

      button {
        min-height: 42px;

        border: 0;

        border-radius: 8px;

        padding: 0.65rem 0.95rem;

        font-weight: 700;

        cursor: pointer;
      }

      .period-toggle button {
        background: transparent;

        color: #475569;
      }

      :host-context(.dark-mode) .period-toggle button {
        color: #cbd5e1;
      }

      .period-toggle button.active,
      .refresh-btn {
        background: #2563eb;

        color: white;
      }

      .refresh-btn:disabled {
        opacity: 0.6;

        cursor: wait;
      }

      .kpi-grid {
        display: grid;

        grid-template-columns: repeat(3, minmax(0, 1fr));

        gap: 1rem;

        margin-bottom: 1rem;
      }

      .loan-grid {
        grid-template-columns: repeat(3, minmax(0, 1fr));

        margin-bottom: 1.5rem;
      }

      .kpi,
      .chart-panel,
      .error-card {
        background: #ffffff;

        border: 1px solid #e2e8f0;

        border-radius: 12px;

        padding: 1.25rem;

        box-shadow: 0 12px 30px rgba(15, 23, 42, 0.08);
      }

      :host-context(.dark-mode) .kpi,
      :host-context(.dark-mode) .chart-panel,
      :host-context(.dark-mode) .error-card {
        background: rgba(22, 33, 62, 0.94);

        border-color: rgba(96, 165, 250, 0.16);

        box-shadow: 0 16px 35px rgba(0, 0, 0, 0.18);
      }

      .kpi {
        min-height: 120px;

        display: flex;

        flex-direction: column;

        justify-content: space-between;
      }

      .kpi span {
        color: #64748b;
      }

      :host-context(.dark-mode) .kpi span {
        color: #a8bddf;
      }

      .kpi strong {
        font-size: clamp(1.35rem, 2vw, 2rem);

        color: #059669;

        overflow-wrap: anywhere;
      }

      .kpi.warning strong {
        color: #dc2626;
      }

      .kpi.loan strong {
        color: #2563eb;
      }

      .kpi.audit strong {
        color: #d97706;
      }

      .charts-grid {
        display: grid;

        grid-template-columns: repeat(2, minmax(0, 1fr));

        gap: 1rem;
      }

      .chart-panel {
        min-height: 340px;

        min-width: 0;
      }

      .chart-panel.wide {
        grid-column: 1 / -1;
      }

      canvas {
        width: 100% !important;

        height: 270px !important;

        margin-top: 1rem;
      }

      .error-card {
        color: #dc2626;

        margin-bottom: 1rem;
      }

      @media (max-width: 1024px) {
        .kpi-grid,
        .loan-grid,
        .charts-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }

      @media (max-width: 768px) {
        .title-row,
        .actions,
        .kpi-grid,
        .loan-grid,
        .charts-grid {
          display: grid;

          grid-template-columns: 1fr;
        }

        .actions,
        .title-row {
          align-items: stretch;
        }

        .period-toggle {
          display: grid;

          grid-template-columns: repeat(3, 1fr);
        }

        .refresh-btn {
          width: 100%;
        }

        canvas {
          height: 230px !important;
        }
      }
    `,
  ],
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  @ViewChild('transactionTrendChart') transactionTrendChartRef?: ElementRef<HTMLCanvasElement>;

  @ViewChild('categoryChart') categoryChartRef?: ElementRef<HTMLCanvasElement>;

  @ViewChild('loanChart') loanChartRef?: ElementRef<HTMLCanvasElement>;

  stats: AdminDashboardStats | null = null;

  advanced: AdminAdvancedAnalytics | null = null;

  periods: Array<'7D' | '30D' | 'YTD'> = ['7D', '30D', 'YTD'];

  period: '7D' | '30D' | 'YTD' = '30D';

  loading = false;

  errorMessage = '';

  private charts: Chart[] = [];

  private analyticsCache = new Map<
    string,
    {
      stats: AdminDashboardStats;

      advanced: AdminAdvancedAnalytics;
    }
  >();

  constructor(
    private service: AdminDashboardService,

    private themeService: ThemeService,

    private cdr: ChangeDetectorRef,
  ) {
    effect(() => {
      this.themeService.isDarkMode();

      this.refreshChartTheme();

      this.cdr.markForCheck();
    });
  }

  ngOnInit(): void {
    this.load();
  }

  ngOnDestroy(): void {
    this.charts.forEach((chart) => chart.destroy());
  }

  setPeriod(period: '7D' | '30D' | 'YTD'): void {
    if (this.period === period) return;

    this.period = period;

    const cached = this.analyticsCache.get(period);

    if (cached) {
      this.stats = cached.stats;

      this.advanced = cached.advanced;

      this.cdr.detectChanges();

      requestAnimationFrame(() => {
        this.renderCharts();
      });

      return;
    }

    this.load();
  }

  load(): void {
    this.loading = true;

    this.errorMessage = '';

    this.cdr.detectChanges();

    forkJoin({
      stats: this.service.getDashboard(),

      advanced: this.service.getAdvancedAnalytics(this.period),
    }).subscribe({
      next: ({ stats, advanced }) => {
        this.stats = stats;

        this.advanced = advanced;

        // Cache current period

        this.analyticsCache.set(this.period, {
          stats,

          advanced,
        });

        this.loading = false;

        this.cdr.detectChanges();

        requestAnimationFrame(() => {
          this.renderCharts();

          this.cdr.markForCheck();
        });
      },

      error: (error) => {
        this.loading = false;

        this.errorMessage = error.error?.message || 'Admin dashboard could not be loaded.';

        this.cdr.detectChanges();
      },
    });
  }

  private renderCharts(): void {
    if (!this.advanced) return;

    this.charts.forEach((chart) => chart.destroy());

    this.charts = [];

    this.addChart(this.transactionTrendChartRef, {
      type: 'line',

      data: {
        labels: this.advanced.transactionTrend.map((i) => i.monthLabel),

        datasets: [
          {
            label: 'Credit',

            data: this.advanced.transactionTrend.map((i) => i.totalIncome),

            borderColor: '#10b981',

            backgroundColor: 'rgba(16,185,129,.14)',

            tension: 0.35,
          },

          {
            label: 'Debit',

            data: this.advanced.transactionTrend.map((i) => i.totalExpense),

            borderColor: '#ef4444',

            backgroundColor: 'rgba(239,68,68,.14)',

            tension: 0.35,
          },
        ],
      },

      options: this.chartOptions(),
    });

    this.addChart(this.categoryChartRef, {
      type: 'bar',

      data: {
        labels: this.advanced.transactionCategoryBreakdown.map((i) => i.label),

        datasets: [
          {
            label: 'Debit Amount',

            data: this.advanced.transactionCategoryBreakdown.map((i) => i.value),

            backgroundColor: this.palette(),
          },
        ],
      },

      options: this.chartOptions(),
    });

    this.addChart(this.loanChartRef, {
      type: 'doughnut',

      data: {
        labels: this.advanced.loanStatusDistribution.map((i) => i.label),

        datasets: [
          {
            data: this.advanced.loanStatusDistribution.map((i) => i.value),

            backgroundColor: ['#f59e0b', '#10b981', '#ef4444', '#3b82f6'],
          },
        ],
      },

      options: this.chartOptions('doughnut'),
    });
  }

  private addChart(ref: ElementRef<HTMLCanvasElement> | undefined, config: any): void {
    if (!ref?.nativeElement) return;

    this.charts.push(new Chart(ref.nativeElement, config));
  }

  private chartOptions(type?: string): any {
    const dark = this.themeService.isDarkMode();

    const textColor = dark ? '#dbeafe' : '#334155';

    const gridColor = dark ? 'rgba(148, 163, 184, 0.18)' : 'rgba(100, 116, 139, 0.18)';

    return {
      responsive: true,

      maintainAspectRatio: false,

      plugins: {
        legend: { labels: { color: textColor, usePointStyle: true } },

        tooltip: {
          backgroundColor: dark ? '#0f172a' : '#ffffff',

          titleColor: textColor,

          bodyColor: textColor,

          borderColor: gridColor,

          borderWidth: 1,
        },
      },

      ...(type !== 'doughnut' && {
        scales: {
          x: { ticks: { color: textColor }, grid: { color: gridColor } },

          y: { ticks: { color: textColor }, grid: { color: gridColor }, beginAtZero: true },
        },
      }),
    };
  }

  private refreshChartTheme(): void {
    if (!this.charts.length) return;

    this.charts.forEach((chart) => {
      const chartType = (chart.config as any).type || (chart.config as any)._config?.type;

      chart.options = this.chartOptions(chartType);

      chart.update();
    });
  }

  private palette(): string[] {
    return ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];
  }
}
