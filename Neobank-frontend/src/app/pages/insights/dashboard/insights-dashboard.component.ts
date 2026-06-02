import { CommonModule } from '@angular/common';

import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  AfterViewChecked,
  ViewChild,
} from '@angular/core';

import { Chart, registerables } from 'chart.js';

import { AuthService } from '../../../services/auth.service';

import { FinancialInsights, InsightsService } from '../../../services/insights.service';

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

          <p>Income, expenses, savings, and six-month money trends.</p>
        </div>

        <button class="btn-refresh" (click)="loadInsights()">Refresh</button>
      </div>

      <div class="skeleton-grid" *ngIf="loading">
        <div class="skeleton-card" *ngFor="let item of [1, 2, 3, 4]"></div>
      </div>

      <ng-container *ngIf="!loading && insights">
        <div class="kpi-grid">
          <article class="kpi-card income">
            <span>Total Income</span>

            <strong>₹{{ insights.totalIncome | number }}</strong>
          </article>

          <article class="kpi-card expense">
            <span>Total Expense</span>

            <strong>₹{{ insights.totalExpense | number }}</strong>
          </article>

          <article class="kpi-card savings" [class.negative]="insights.savings < 0">
            <span>Savings</span>

            <strong>₹{{ insights.savings | number }}</strong>
          </article>

          <article class="kpi-card summary">
            <span>Monthly Financial Summary</span>

            <strong>{{ insights.trendSummary.length }} months</strong>
          </article>
        </div>

        <div class="charts-grid">
          <div class="chart-panel">
            <h3>Income vs Expense</h3>

            <canvas #trendChart></canvas>
          </div>

          <div class="chart-panel">
            <h3>Monthly Savings</h3>

            <canvas #savingsChart></canvas>
          </div>

          <div class="chart-panel">
            <h3>Financial Summary</h3>

            <canvas #summaryChart></canvas>
          </div>
        </div>
      </ng-container>
    </section>
  `,

  styles: [
    `
      .insights-shell {
        padding: 2rem;
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
        color: #9fb3d9;
        margin-top: 0.35rem;
      }

      .btn-refresh {
        border: 0;
        border-radius: 8px;
        background: #3b82f6;
        color: white;
        padding: 0.7rem 1rem;
        font-weight: 700;
        cursor: pointer;
      }

      .kpi-grid,
      .skeleton-grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 1rem;
        margin-bottom: 1.5rem;
      }

      .kpi-card,
      .skeleton-card,
      .chart-panel {
        background: rgba(22, 33, 62, 0.92);
        border: 1px solid rgba(96, 165, 250, 0.14);
        border-radius: 12px;
      }

      .kpi-card {
        min-height: 130px;
        padding: 1.25rem;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        box-shadow: 0 16px 35px rgba(0, 0, 0, 0.18);
      }

      .kpi-card span {
        color: #a9bddf;
      }

      .kpi-card strong {
        font-size: 2rem;
      }

      .income strong {
        color: #34d399;
      }

      .expense strong {
        color: #f87171;
      }

      .savings strong {
        color: #60a5fa;
      }

      .savings.negative strong {
        color: #fb7185;
      }

      .summary strong {
        color: #fbbf24;
      }

      .charts-grid {
        display: grid;
        grid-template-columns: 2fr 1.2fr;
        gap: 1rem;
      }

      .chart-panel {
        min-height: 340px;
        padding: 1.25rem;
      }

      .chart-panel:last-child {
        grid-column: 1 / -1;
        min-height: 300px;
      }

      canvas {
        width: 100% !important;
        height: 260px !important;
        margin-top: 1rem;
      }

      .skeleton-card {
        height: 130px;
        animation: pulse 1.2s ease-in-out infinite;
        background: linear-gradient(90deg, #14213f, #1d315d, #14213f);
      }

      @keyframes pulse {
        50% {
          opacity: 0.55;
        }
      }

      @media (max-width: 900px) {
        .kpi-grid,
        .skeleton-grid,
        .charts-grid {
          grid-template-columns: 1fr;
        }
        .chart-panel:last-child {
          grid-column: auto;
        }
      }
    `,
  ],
})
export class InsightsDashboardComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('trendChart') trendChartRef?: ElementRef<HTMLCanvasElement>;

  @ViewChild('savingsChart') savingsChartRef?: ElementRef<HTMLCanvasElement>;

  @ViewChild('summaryChart') summaryChartRef?: ElementRef<HTMLCanvasElement>;

  insights: FinancialInsights | null = null;

  loading = true;

  private charts: Chart[] = [];

  private chartsInitialized = false;

  constructor(
    private insightsService: InsightsService,

    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.loadInsights();
  }

  ngAfterViewChecked(): void {
    // ✅ FIX: render charts only when DOM is ready

    if (!this.loading && this.insights && !this.chartsInitialized) {
      this.renderCharts();

      this.chartsInitialized = true;
    }
  }

  loadInsights(): void {
    const userId = this.authService.getUser()?.id;

    if (!userId) return;

    this.loading = true;

    this.chartsInitialized = false; // ✅ reset on refresh

    this.insightsService.getInsights(userId).subscribe({
      next: (data) => {
        this.insights = data;

        this.loading = false;
      },

      error: () => (this.loading = false),
    });
  }

  ngOnDestroy(): void {
    this.charts.forEach((chart) => chart.destroy());
  }

  private renderCharts(): void {
    if (!this.insights) return;

    this.charts.forEach((chart) => chart.destroy());

    this.charts = [];

    const labels = this.insights.trendSummary.map((i) => i.monthLabel);

    const income = this.insights.trendSummary.map((i) => i.totalIncome);

    const expense = this.insights.trendSummary.map((i) => i.totalExpense);

    const savings = this.insights.trendSummary.map((i) => i.totalIncome - i.totalExpense);

    if (this.trendChartRef?.nativeElement) {
      this.charts.push(
        new Chart(this.trendChartRef.nativeElement, {
          type: 'line',

          data: {
            labels,

            datasets: [
              {
                label: 'Income',
                data: income,
                borderColor: '#34d399',
                backgroundColor: 'rgba(52,211,153,.12)',
                tension: 0.35,
              },

              {
                label: 'Expense',
                data: expense,
                borderColor: '#f87171',
                backgroundColor: 'rgba(248,113,113,.12)',
                tension: 0.35,
              },
            ],
          },

          options: this.chartOptions(),
        }),
      );
    }

    if (this.savingsChartRef?.nativeElement) {
      this.charts.push(
        new Chart(this.savingsChartRef.nativeElement, {
          type: 'bar',

          data: {
            labels,

            datasets: [{ label: 'Savings', data: savings, backgroundColor: '#60a5fa' }],
          },

          options: this.chartOptions(),
        }),
      );
    }

    if (this.summaryChartRef?.nativeElement) {
      this.charts.push(
        new Chart(this.summaryChartRef.nativeElement, {
          type: 'doughnut',

          data: {
            labels: ['Income', 'Expense', 'Savings'],

            datasets: [
              {
                data: [
                  this.insights.totalIncome,

                  this.insights.totalExpense,

                  Math.abs(this.insights.savings),
                ],

                backgroundColor: ['#34d399', '#f87171', '#60a5fa'],
              },
            ],
          },

          options: this.chartOptions('doughnut'),
        }),
      );
    }
  }

  private chartOptions(type?: string): any {
    return {
      responsive: true,

      maintainAspectRatio: false,

      plugins: {
        legend: { labels: { color: '#dbeafe' } },
      },

      ...(type !== 'doughnut' && {
        scales: {
          x: { ticks: { color: '#b6c6e4' } },

          y: { ticks: { color: '#b6c6e4' } },
        },
      }),
    };
  }
}
