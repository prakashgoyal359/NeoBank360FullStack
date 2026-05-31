import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { AdminDashboardService, AdminDashboardStats } from '../../../services/admin-dashboard.service';

Chart.register(...registerables);

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="admin-analytics">
      <div class="title-row">
        <div><h2>Platform Analytics</h2><p>Live enterprise KPIs from core banking data.</p></div>
        <button (click)="load()">Refresh</button>
      </div>
      <div class="kpi-grid">
        <div class="kpi"><span>Total Users</span><strong>{{ stats?.totalUsers || 0 }}</strong></div>
        <div class="kpi"><span>Active Users</span><strong>{{ stats?.totalActiveUsers || 0 }}</strong></div>
        <div class="kpi"><span>Total Loans</span><strong>{{ stats?.totalLoans || 0 }}</strong></div>
        <div class="kpi"><span>Pending Approvals</span><strong>{{ stats?.pendingApprovals || 0 }}</strong></div>
        <div class="kpi"><span>Transactions</span><strong>{{ stats?.totalTransactions || 0 }}</strong></div>
        <div class="kpi"><span>Savings Rate</span><strong>{{ stats?.platformSavingsRate || 0 }}%</strong></div>
      </div>
      <div class="chart-panel"><canvas #kpiChart></canvas></div>
    </section>
  `,
  styles: [`
    .admin-analytics { padding: 2rem; color: #f8fafc; }
    .title-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
    h2, p { margin: 0; } p { color: #a8bddf; margin-top: .35rem; }
    button { background: #3b82f6; color: white; border: 0; border-radius: 8px; padding: .7rem 1rem; font-weight: 700; cursor: pointer; }
    .kpi-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1rem; }
    .kpi, .chart-panel { background: rgba(22,33,62,.94); border: 1px solid rgba(96,165,250,.14); border-radius: 12px; padding: 1.25rem; }
    .kpi { min-height: 120px; display: flex; flex-direction: column; justify-content: space-between; }
    .kpi span { color: #a8bddf; } .kpi strong { font-size: 2rem; color: #34d399; }
    .chart-panel { margin-top: 1rem; min-height: 320px; }
    canvas { width: 100% !important; height: 280px !important; }
    @media (max-width: 900px) { .kpi-grid { grid-template-columns: 1fr; } }
  `],
})
export class AdminDashboardComponent implements OnInit {
  @ViewChild('kpiChart') kpiChartRef?: ElementRef<HTMLCanvasElement>;
  stats: AdminDashboardStats | null = null;
  private chart?: Chart;

  constructor(private service: AdminDashboardService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.service.getDashboard().subscribe((stats) => {
      this.stats = stats;
      setTimeout(() => this.renderChart());
    });
  }

  private renderChart(): void {
    if (!this.stats || !this.kpiChartRef) return;
    this.chart?.destroy();
    this.chart = new Chart(this.kpiChartRef.nativeElement, {
      type: 'bar',
      data: {
        labels: ['Users', 'Active', 'Loans', 'Pending', 'Transactions'],
        datasets: [{ label: 'Platform KPI', data: [this.stats.totalUsers, this.stats.totalActiveUsers, this.stats.totalLoans, this.stats.pendingApprovals, this.stats.totalTransactions], backgroundColor: ['#60a5fa', '#34d399', '#a78bfa', '#fbbf24', '#f87171'] }],
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: '#dbeafe' } } }, scales: { x: { ticks: { color: '#c7d2fe' } }, y: { ticks: { color: '#c7d2fe' }, beginAtZero: true } } },
    });
  }
}
