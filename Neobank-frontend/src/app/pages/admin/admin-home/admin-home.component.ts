import { Component, Input, AfterViewInit, ViewChild, ElementRef, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import { Account, AccountOpeningResponse } from '../../../models/banking.model';

Chart.register(...registerables);

@Component({
  selector: 'app-admin-home',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="home-container">
      <div class="stats-grid">
        <div class="stat-card users">
          <div class="stat-icon">👥</div>
          <div class="stat-content">
            <h3>Total Users</h3>
            <p class="stat-number">{{ totalUsers }}</p>
          </div>
        </div>

        <div class="stat-card pending">
          <div class="stat-icon">⏳</div>
          <div class="stat-content">
            <h3>Pending</h3>
            <p class="stat-number">{{ pendingCount }}</p>
          </div>
        </div>

        <div class="stat-card approved">
          <div class="stat-icon">✅</div>
          <div class="stat-content">
            <h3>Approved</h3>
            <p class="stat-number">{{ approvedCount }}</p>
          </div>
        </div>

        <div class="stat-card rejected">
          <div class="stat-icon">❌</div>
          <div class="stat-content">
            <h3>Rejected</h3>
            <p class="stat-number">{{ rejectedCount }}</p>
          </div>
        </div>
      </div>

      <div class="charts-grid">
        <div class="chart-card">
          <h3>User Status Distribution</h3>
          <div class="pie-chart-container">
            <canvas #userStatusChart></canvas>
          </div>
          <div class="chart-legend">
            <div><span class="legend-dot approved"></span> Approved ({{ approvedCount }})</div>
            <div><span class="legend-dot pending"></span> Pending ({{ pendingCount }})</div>
            <div><span class="legend-dot rejected"></span> Rejected ({{ rejectedCount }})</div>
          </div>
        </div>

        <div class="chart-card">
          <h3>Recent Applications</h3>
          <ul class="recent-list">
            <li *ngFor="let app of recentApplications">
              <div class="recent-item">
                <div class="recent-name">{{ app.fullName }}</div>
                <div class="recent-email">{{ app.email }}</div>
                <span class="status-badge" [ngClass]="app.status.toLowerCase()">
                  {{ app.status }}
                </span>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./admin-home.component.css'],
})
export class AdminHomeComponent implements AfterViewInit, OnDestroy, OnChanges {
  @Input() accounts: Account[] = [];
  @Input() allApplications: AccountOpeningResponse[] = [];
  @ViewChild('userStatusChart') chartRef!: ElementRef;
  chart: Chart | null = null;

  get totalUsers(): number {
    return this.accounts.length;
  }

  get pendingCount(): number {
    return this.allApplications.filter((a) => a.status === 'PENDING').length;
  }

  // Approved = total number of approved accounts (active accounts)
  get approvedCount(): number {
    return this.accounts.filter((a) => a.isActive !== false).length;
  }

  get rejectedCount(): number {
    return this.allApplications.filter((a) => a.status === 'REJECTED').length;
  }

  get recentApplications(): AccountOpeningResponse[] {
    return this.allApplications.slice(0, 5);
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.createChart(), 100);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.chart) {
      this.updateChart();
    } else if (this.chartRef?.nativeElement && this.allApplications.length > 0) {
      setTimeout(() => this.createChart(), 100);
    }
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
    }
  }

  createChart(): void {
    if (!this.chartRef?.nativeElement) return;

    const ctx = this.chartRef.nativeElement.getContext('2d');
    this.chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Approved', 'Pending', 'Rejected'],
        datasets: [{
          data: [this.approvedCount, this.pendingCount, this.rejectedCount],
          backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
          borderWidth: 2,
          borderColor: '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '60%',
        plugins: {
          legend: {
            display: false
          }
        }
      }
    });
  }

  updateChart(): void {
    if (!this.chart) return;
    this.chart.data.datasets[0].data = [this.approvedCount, this.pendingCount, this.rejectedCount];
    this.chart.update();
  }
}
