import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminDashboardService, PendingApproval } from '../../../services/admin-dashboard.service';

@Component({
  selector: 'app-pending-approvals',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="panel">
      <div class="title-row">
        <div><h2>Pending Approvals</h2><p>Oldest-first loan approval queue.</p></div>
        <select [(ngModel)]="moduleFilter" (change)="load()">
          <option value="">All Modules</option>
          <option value="LOAN">Loans</option>
        </select>
      </div>
      <table>
        <thead><tr><th>Applicant</th><th>Module</th><th>Product</th><th>Amount</th><th>Applied</th><th>Status</th></tr></thead>
        <tbody>
          <tr *ngFor="let item of approvals">
            <td>{{ item.applicantName }}</td>
            <td>{{ item.module }}</td>
            <td>{{ item.productName }}</td>
            <td>₹{{ item.requestedAmount | number }}</td>
            <td>{{ item.applicationDate | date:'medium' }}</td>
            <td><span class="chip pending">{{ item.status }}</span></td>
          </tr>
          <tr *ngIf="approvals.length === 0"><td colspan="6" class="empty">No pending approvals</td></tr>
        </tbody>
      </table>
    </section>
  `,
  styles: [`
    .panel { padding: 2rem; color: #f8fafc; }
    .title-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
    h2, p { margin: 0; } p { color: #a8bddf; margin-top: .35rem; }
    select { background: #12345d; color: #e5efff; border: 1px solid #2d5b91; border-radius: 8px; padding: .7rem; }
    table { width: 100%; border-collapse: collapse; background: rgba(22,33,62,.94); border-radius: 12px; overflow: hidden; }
    th, td { padding: 1rem; border-bottom: 1px solid rgba(148,163,184,.18); text-align: left; }
    th { color: #bfdbfe; }
    .chip { border-radius: 999px; padding: .25rem .7rem; font-size: .8rem; font-weight: 800; }
    .pending { background: rgba(251,191,36,.18); color: #fbbf24; }
    .empty { text-align: center; color: #a8bddf; }
  `],
})
export class PendingApprovalsComponent implements OnInit {
  approvals: PendingApproval[] = [];
  moduleFilter = '';
  constructor(private service: AdminDashboardService) {}
  ngOnInit(): void { this.load(); }
  load(): void { this.service.getPendingApprovals(this.moduleFilter).subscribe((data) => this.approvals = data); }
}
