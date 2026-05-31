import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AdminDashboardService, SystemHealth } from '../../../services/admin-dashboard.service';

@Component({
  selector: 'app-system-health',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="health">
      <div class="title-row">
        <div><h2>System Health</h2><p>Live monitoring from the banking backend.</p></div>
        <button (click)="load()">Refresh</button>
      </div>
      <div class="health-grid" *ngIf="health">
        <article><span>Database</span><strong [class.up]="health.databaseStatus === 'UP'" [class.down]="health.databaseStatus !== 'UP'">{{ health.databaseStatus }}</strong></article>
        <article><span>Application</span><strong [class.up]="health.applicationHealth === 'UP'" [class.down]="health.applicationHealth !== 'UP'">{{ health.applicationHealth }}</strong></article>
        <article><span>Active Sessions</span><strong>{{ health.activeSessionCount }}</strong></article>
        <article><span>Uptime</span><strong>{{ health.serverUptime }}</strong></article>
      </div>
    </section>
  `,
  styles: [`
    .health { padding: 2rem; color: #f8fafc; }
    .title-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
    h2, p { margin: 0; } p { color: #a8bddf; margin-top: .35rem; }
    button { background: #3b82f6; color: white; border: 0; border-radius: 8px; padding: .7rem 1rem; font-weight: 700; cursor: pointer; }
    .health-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 1rem; }
    article { background: rgba(22,33,62,.94); border: 1px solid rgba(96,165,250,.14); border-radius: 12px; padding: 1.25rem; min-height: 130px; display: flex; flex-direction: column; justify-content: space-between; }
    span { color: #a8bddf; } strong { font-size: 1.7rem; }
    .up { color: #34d399; } .down { color: #f87171; }
    @media (max-width: 900px) { .health-grid { grid-template-columns: 1fr; } }
  `],
})
export class SystemHealthComponent implements OnInit {
  health: SystemHealth | null = null;
  constructor(private service: AdminDashboardService) {}
  ngOnInit(): void { this.load(); }
  load(): void { this.service.getSystemHealth().subscribe((data) => this.health = data); }
}
