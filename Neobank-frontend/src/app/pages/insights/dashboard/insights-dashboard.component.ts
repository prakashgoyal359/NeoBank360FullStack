import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  AfterViewInit,
  ChangeDetectorRef,
  effect,
} from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { AuthService } from '../../../services/auth.service';
import {
  FinancialInsights,
  InsightsService,
  UserAdvancedAnalytics,
} from '../../../services/insights.service';
import { ThemeService } from '../../../services/theme.service';

Chart.register(...registerables);

@Component({
  selector: 'app-insights-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="insights-shell">
      <div class="section-title-row">
        <div>
          <h2>Financial Insights</h2>
          <p>Spending, savings, budget, rewards, net worth, and loan payoff analytics.</p>
        </div>
        <button class="btn-refresh" (click)="loadInsights()" [disabled]="loading">
          {{ loading ? 'Loading...' : 'Refresh' }}
        </button>
      </div>

      <div class="skeleton-grid" *ngIf="loading">
        <div class="skeleton-card" *ngFor="let item of [1, 2, 3, 4]"></div>
      </div>

      <div class="error-card" *ngIf="!loading && errorMessage">{{ errorMessage }}</div>

      <ng-container *ngIf="!loading && insights">
        <div class="kpi-grid">
          <article class="kpi-card income">
            <span>Total Income</span>
            <strong>Rs {{ insights.totalIncome | number }}</strong>
          </article>
          <article class="kpi-card expense">
            <span>Total Expense</span>
            <strong>Rs {{ insights.totalExpense | number }}</strong>
          </article>
          <article class="kpi-card savings" [class.negative]="insights.savings < 0">
            <span>Savings</span>
            <strong>Rs {{ insights.savings | number }}</strong>
          </article>
          <article class="kpi-card summary">
            <span>Net Worth</span>
            <strong>Rs {{ advanced?.currentNetWorth || 0 | number }}</strong>
          </article>
        </div>

        <div class="kpi-grid wealth-grid" *ngIf="advanced">
          <article class="metric-card">
            <span>Account Balance</span>
            <strong>Rs {{ advanced.accountBalance | number }}</strong>
          </article>
          <article class="metric-card warning">
            <span>Outstanding Loans</span>
            <strong>Rs {{ advanced.outstandingLoans | number }}</strong>
          </article>
          <article class="metric-card reward">
            <span>Reward Points</span>
            <strong>{{ advanced.rewardBalance || 0 | number }}</strong>
          </article>
        </div>

        <div class="charts-grid">
          <div class="chart-panel wide">
            <h3>Income vs Expense Trend</h3>
            <div><canvas #trendChart></canvas></div>
          </div>
          <div class="chart-panel">
            <h3>Spending Analytics</h3>
            <div><canvas #spendingChart></canvas></div>
          </div>
          <div class="chart-panel">
            <h3>Budget vs Actual</h3>
            <div><canvas #budgetChart></canvas></div>
          </div>
          <div class="chart-panel">
            <h3>Net Worth Progression</h3>
            <div><canvas #netWorthChart></canvas></div>
          </div>
          <div class="chart-panel">
            <h3>Reward Growth</h3>
            <div><canvas #rewardChart></canvas></div>
          </div>
          <div class="chart-panel wide">
            <h3>Loan Payoff Forecast</h3>
            <div><canvas #loanForecastChart></canvas></div>
          </div>
        </div>
      </ng-container>
    </section>
  `,
  styles: [
    `
      .insights-shell {
        padding: clamp(1rem, 2vw, 2rem);
        color: var(--text-primary, #0f172a);
        min-width: 0;
      }
      :host-context(.dark-mode) .insights-shell {
        color: #f8fafc;
      }
      .section-title-row {
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
        color: #9fb3d9;
      }
      .btn-refresh {
        border: 0;
        border-radius: 8px;
        background: #2563eb;
        color: white;
        padding: 0.75rem 1rem;
        font-weight: 700;
        cursor: pointer;
        min-height: 44px;
      }
      .btn-refresh:disabled {
        opacity: 0.6;
        cursor: wait;
      }
      .kpi-grid,
      .skeleton-grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 1rem;
        margin-bottom: 1.5rem;
      }
      .wealth-grid {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }
      .kpi-card,
      .metric-card,
      .skeleton-card,
      .chart-panel,
      .error-card {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        box-shadow: 0 12px 30px rgba(15, 23, 42, 0.08);
      }
      :host-context(.dark-mode) .kpi-card,
      :host-context(.dark-mode) .metric-card,
      :host-context(.dark-mode) .skeleton-card,
      :host-context(.dark-mode) .chart-panel,
      :host-context(.dark-mode) .error-card {
        background: rgba(22, 33, 62, 0.94);
        border-color: rgba(96, 165, 250, 0.16);
        box-shadow: 0 16px 35px rgba(0, 0, 0, 0.18);
      }
      .kpi-card,
      .metric-card {
        min-height: 120px;
        padding: 1.25rem;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }
      .kpi-card span,
      .metric-card span {
        color: #64748b;
      }
      :host-context(.dark-mode) .kpi-card span,
      :host-context(.dark-mode) .metric-card span {
        color: #a9bddf;
      }
      .kpi-card strong,
      .metric-card strong {
        font-size: clamp(1.4rem, 2vw, 2rem);
        overflow-wrap: anywhere;
      }
      .income strong,
      .metric-card strong {
        color: #059669;
      }
      .expense strong,
      .warning strong {
        color: #dc2626;
      }
      .savings strong {
        color: #2563eb;
      }
      .savings.negative strong {
        color: #e11d48;
      }
      .summary strong,
      .reward strong {
        color: #d97706;
      }
      .charts-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 1rem;
      }
      .chart-panel {
        min-height: 340px;
        padding: 1.25rem;
        min-width: 0;
        display: flex;
        flex-direction: column;
      }
      .chart-panel.wide {
        grid-column: 1 / -1;
      }
      canvas {
        width: 100% !important;
        height: 270px !important;
        margin-top: 0 !important;
        display: block;
      }
      .skeleton-card {
        height: 130px;
        animation: pulse 1.2s ease-in-out infinite;
        background: linear-gradient(90deg, #e2e8f0, #f8fafc, #e2e8f0);
      }
      :host-context(.dark-mode) .skeleton-card {
        background: linear-gradient(90deg, #14213f, #1d315d, #14213f);
      }
      .error-card {
        color: #dc2626;
        padding: 1rem;
      }
      @keyframes pulse {
        50% {
          opacity: 0.55;
        }
      }
      @media (max-width: 1024px) {
        .kpi-grid,
        .wealth-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
        .charts-grid {
          grid-template-columns: 1fr;
        }
        canvas {
          height: 250px !important;
        }
      }
      @media (max-width: 768px) {
        .section-title-row,
        .kpi-grid,
        .wealth-grid,
        .skeleton-grid {
          grid-template-columns: 1fr;
        }
        .charts-grid {
          grid-template-columns: 1fr;
        }
        .section-title-row {
          align-items: stretch;
          flex-direction: column;
        }
        .btn-refresh {
          width: 100%;
        }
        .chart-panel {
          min-height: 300px;
        }
        canvas {
          height: 220px !important;
        }
      }
    `,
  ],
})
export class InsightsDashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('trendChart', { static: false }) trendChartRef?: ElementRef<HTMLCanvasElement>;
  @ViewChild('spendingChart', { static: false }) spendingChartRef?: ElementRef<HTMLCanvasElement>;
  @ViewChild('budgetChart', { static: false }) budgetChartRef?: ElementRef<HTMLCanvasElement>;
  @ViewChild('netWorthChart', { static: false }) netWorthChartRef?: ElementRef<HTMLCanvasElement>;
  @ViewChild('rewardChart', { static: false }) rewardChartRef?: ElementRef<HTMLCanvasElement>;
  @ViewChild('loanForecastChart', { static: false })
  loanForecastChartRef?: ElementRef<HTMLCanvasElement>;

  insights: FinancialInsights | null = null;
  advanced: UserAdvancedAnalytics | null = null;
  loading = true;
  errorMessage = '';

  private charts: Chart[] = [];

  constructor(
    private insightsService: InsightsService,
    private authService: AuthService,
    private themeService: ThemeService,
    private cdr: ChangeDetectorRef,
  ) {
    effect(() => {
      this.themeService.isDarkMode();
      this.refreshChartTheme();
    });
  }

  ngOnInit(): void {
    this.loadInsights();
  }

  ngAfterViewInit(): void {
    // After view initialization, try to render charts if data is already loaded
    if (!this.loading && this.insights) {
      setTimeout(() => {
        this.renderCharts();
        this.cdr.detectChanges();
      }, 50);
    }
  }

  loadInsights(): void {
    const userId = this.authService.getUser()?.id;
    if (!userId) {
      this.loading = false;
      this.errorMessage = 'Please login again to load insights.';
      this.cdr.markForCheck();
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.cdr.markForCheck();

    this.insightsService.getInsights(userId).subscribe({
      next: (data) => {
        this.insights = data;
        this.cdr.markForCheck();
        this.insightsService.getAdvancedInsights(userId).subscribe({
          next: (advanced) => {
            this.advanced = advanced;
            this.loading = false;
            this.cdr.markForCheck();
            // Use longer timeout to ensure DOM is fully ready and ViewChild refs are available
            setTimeout(() => {
              this.renderCharts();
              this.cdr.detectChanges();
            }, 200);
          },
          error: (error) => {
            this.loading = false;
            this.errorMessage = error.error?.message || 'Advanced analytics could not be loaded.';
            this.cdr.markForCheck();
            // Still try to render with available data
            setTimeout(() => {
              this.renderCharts();
              this.cdr.detectChanges();
            }, 200);
          },
        });
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error.error?.message || 'Insights could not be loaded.';
        this.cdr.markForCheck();
      },
    });
  }

  ngOnDestroy(): void {
    this.charts.forEach((chart) => chart.destroy());
  }

  private renderCharts(): void {
    if (!this.insights) return;

    // Destroy existing charts
    this.charts.forEach((chart) => chart.destroy());
    this.charts = [];

    // Check if canvas refs are available
    const allRefsReady =
      this.trendChartRef?.nativeElement &&
      this.spendingChartRef?.nativeElement &&
      this.budgetChartRef?.nativeElement &&
      this.netWorthChartRef?.nativeElement &&
      this.rewardChartRef?.nativeElement &&
      this.loanForecastChartRef?.nativeElement;

    if (!allRefsReady) {
      console.warn('Not all canvas elements are ready, retrying...');
      setTimeout(() => {
        this.renderCharts();
        this.cdr.detectChanges();
      }, 100);
      return;
    }

    // Force layout recalculation for all canvas containers
    [
      this.trendChartRef,
      this.spendingChartRef,
      this.budgetChartRef,
      this.netWorthChartRef,
      this.rewardChartRef,
      this.loanForecastChartRef,
    ].forEach((ref) => {
      if (ref?.nativeElement.parentElement) {
        const parent = ref.nativeElement.parentElement;
        parent.style.display = 'block';
        const rect = parent.getBoundingClientRect();
        if (rect.width === 0) {
          console.warn('Canvas parent has zero width, forcing layout...');
          parent.style.minWidth = '200px';
        }
      }
    });

    const labels = this.insights!.trendSummary.map((i) => i.monthLabel);
    const income = this.insights!.trendSummary.map((i) => i.totalIncome);
    const expense = this.insights!.trendSummary.map((i) => i.totalExpense);

    this.addChart(this.trendChartRef, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Income',
            data: income,
            borderColor: '#10b981',
            backgroundColor: 'rgba(16,185,129,.14)',
            tension: 0.35,
            borderWidth: 2,
          },
          {
            label: 'Expense',
            data: expense,
            borderColor: '#ef4444',
            backgroundColor: 'rgba(239,68,68,.14)',
            tension: 0.35,
            borderWidth: 2,
          },
        ],
      },
      options: this.chartOptions(),
    });

    this.addChart(this.spendingChartRef, {
      type: 'doughnut',
      data: {
        labels: this.advanced?.spendingBreakdown.map((i) => i.label) || [],
        datasets: [
          {
            data: this.advanced?.spendingBreakdown.map((i) => i.value) || [],
            backgroundColor: this.palette(),
          },
        ],
      },
      options: this.chartOptions('doughnut'),
    });

    if (this.advanced?.budgetVsActual && this.advanced.budgetVsActual.length > 0) {
      this.addChart(this.budgetChartRef, {
        type: 'bar',
        data: {
          labels: this.advanced.budgetVsActual.map((i) => i.label) || [],
          datasets: [
            {
              label: 'Budget',
              data: this.advanced.budgetVsActual.map((i) => i.value) || [],
              backgroundColor: '#3b82f6',
              borderRadius: 4,
              borderSkipped: false,
            },
            {
              label: 'Actual',
              data: this.advanced.budgetVsActual.map((i) => i.secondaryValue) || [],
              backgroundColor: '#f59e0b',
              borderRadius: 4,
              borderSkipped: false,
            },
          ],
        },
        options: this.chartOptions(),
      });
    } else {
      console.warn('Budget vs Actual data is empty or unavailable');
      // Still try to render empty chart
      this.addChart(this.budgetChartRef, {
        type: 'bar',
        data: {
          labels: ['No Data'],
          datasets: [
            {
              label: 'Budget',
              data: [0],
              backgroundColor: '#3b82f6',
              borderRadius: 4,
            },
            {
              label: 'Actual',
              data: [0],
              backgroundColor: '#f59e0b',
              borderRadius: 4,
            },
          ],
        },
        options: this.chartOptions(),
      });
    }

    this.addChart(
      this.netWorthChartRef,
      this.lineConfig('Net Worth', this.advanced?.netWorthProgression || [], '#8b5cf6'),
    );
    this.addChart(
      this.rewardChartRef,
      this.barConfig('Rewards', this.advanced?.rewardGrowth || [], '#f59e0b'),
    );
    this.addChart(
      this.loanForecastChartRef,
      this.lineConfig('Remaining Principal', this.advanced?.loanPayoffForecast || [], '#ef4444'),
    );

    // Trigger change detection after charts are rendered
    this.cdr.markForCheck();
    console.log(`Successfully rendered ${this.charts.length} charts`);
  }

  private addChart(ref: ElementRef<HTMLCanvasElement> | undefined, config: any): void {
    if (!ref?.nativeElement) {
      console.warn('Canvas element not found for chart', config.type);
      return;
    }

    const canvas = ref.nativeElement;
    const parent = canvas.parentElement;

    if (!parent) {
      console.warn('Canvas parent not found for chart', config.type);
      return;
    }

    // Ensure parent is visible and has dimensions
    parent.style.display = 'block';
    let rect = parent.getBoundingClientRect();

    // If parent still has no width, set a minimum width
    if (rect.width === 0) {
      parent.style.minWidth = '280px';
      rect = parent.getBoundingClientRect();
    }

    // Set explicit canvas dimensions
    if (rect.width > 0) {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = 270 * dpr;
      canvas.style.width = rect.width + 'px';
      canvas.style.height = '270px';
      canvas.style.display = 'block';
    }

    try {
      const chart = new Chart(canvas, config);
      this.charts.push(chart);
      console.log(
        'Chart created successfully:',
        config.type,
        'Canvas size:',
        canvas.width,
        'x',
        canvas.height,
      );
    } catch (error) {
      console.error('Error creating chart:', error, config.type);
    }
  }

  private lineConfig(
    label: string,
    points: { label: string; value: number }[],
    color: string,
  ): any {
    return {
      type: 'line',
      data: {
        labels: points.map((i) => i.label),
        datasets: [
          {
            label,
            data: points.map((i) => i.value),
            borderColor: color,
            backgroundColor: `${color}22`,
            tension: 0.35,
          },
        ],
      },
      options: this.chartOptions(),
    };
  }

  private barConfig(label: string, points: { label: string; value: number }[], color: string): any {
    return {
      type: 'bar',
      data: {
        labels: points.map((i) => i.label),
        datasets: [{ label, data: points.map((i) => i.value), backgroundColor: color }],
      },
      options: this.chartOptions(),
    };
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
